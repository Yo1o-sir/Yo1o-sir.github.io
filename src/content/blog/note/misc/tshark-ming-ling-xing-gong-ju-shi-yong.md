---
title: tshark命令行工具使用
link: tshark-ming-ling-xing-gong-ju-shi-yong
date: 2026-02-07 16:45:18
description: 简单记录下tshark常见的命令行工具
tags:
  - tshark
  - misc
categories:
  - [笔记, 杂项]

---

## 命令汇总

```bash
tshark -r fetus_pcap.pcap -Y "icmp" -T fields -e frame.len
```

- -r：读取
- -Y：过滤，后加条件
- -T：输出格式，fields 会指定输出纯字段值，不会输出详细解析格式
- -e：要显示的字段，frame.len 是帧长度字段

```bash
tshark -r DNS.pcap -Y "dns.flags.response == 0 && ip.dst == 192.168.191.129 && \!icmp" -T fields -e dns.qry.name
```

我用来查询 dns 子域名列表的

- dns.flags.response==0 是想要结果中只有请求，不要响应
- ip.dst==192.168.191.129 是想提取所有目的 IP 匹配的包（这个需要看情况
- \!icmp 是为了避免出现大量探活主机失败的报错

## 流量汇总

### ICMP

ICPM 协议使用 type 字段表示信息类型：

- type=8:Echo Request
- type=0:echo Reply

#### fetus_pcap.pcap

> 2019 工业信息安全技能大赛个人线上赛

:::download{file="/files/ctfnaxieshi/fetus_pcap.pcap" title="fetus_pcap.pcap附件" description="这个题和icmp协议有点关系"}
:::

这个题目稍微有点点魔改（就第一个包有点点问题

正常来说，我们可以直接用命令行提取所有数据，但是本题中，第一个流量包增加了 hipercontracer 协议，因此本包中没有直接出现所谓的 data 值

```bash
tshark -r fetus_pcap.pcap -Y "icmp.type==8" -T fields -e data.len > result.log
```

<img src="/img/tshark/image-20260207185542744.png" alt="第一个流量包" style="zoom:50%;" />

> 第一个包的结构分析
>
> ```text
> 总帧长度: 121字节
> ├── Ethernet头: 14字节
> └── IP包: 107字节
>     ├── IP头: 20字节
>     └── ICMP包: 87字节
>         ├── ICMP头: 8字节
>         └── ICMP数据: 79字节
>             ├── 实际ICMP payload数据（长度未知）
>             └── HiPerConTracer协议头
>                 ├── Magic Number: 0x71777864
>                 ├── Send TTL: 112 (0x70)
>                 ├── Round: 121 (0x79)
>                 ├── Checksum Tweak: 0x7353
>                 └── Send Time Stamp: Aug 6, 2089 04:22:12.454151034 UTC
> ```
>
> 这个包的总长度是 121,但是我们可以直接看 ICMP 包，出题人的思路是，将 ICMP 包中的 8 字节头去掉就是所有数据，因此答案是 79,但是我们用上面的 tshark 提取会发现结果是 106 这个错误答案，因为我们筛选的是 data.len(俺也不知道这哪里来的)

<img src="/img/tshark/image-20260207185640585.png" alt="第二个流量包" style="zoom:50%;" />

> 后续包的格式都是没有问题的
>
> ```text
> 总帧长度: 148字节
> ├── Ethernet头: 14字节
> └── IP包: 134字节
>     ├── IP头: 20字节
>     └── ICMP包: 114字节
>         ├── ICMP头: 8字节
>         └── ICMP数据: 106字节（纯数据，无HiPerConTracer）
>             └── Data: 70553364694e31435a6c374d64336856556548586c43525635794f6c4f697a5a61693379634544567063476c7875594c56386937796d467a456d457077497147724461334845675a376566384342333530346b4e47305a36725437316e6e516c486c784747566f6e6e77
> ```
>
> 我们用命令行提取的 data.len 是没有任何问题的

可以仔细看看这个关于 icmp 的[协议文章](https://www.rfc-editor.org/rfc/rfc792.html)

我发现了，icmp 是个底层协议，只负责汇报网络状态，就是说可不可达，至于上面的 hipercontracer 协议，不是协议栈标准，是 wireshark 自己的 dissector 识别结果(因为这里的魔数恰好匹配上了)，可以把它当作第一个包的载荷数据即可

可以使用的 exp

> 综合考虑了下第一个包和其他包的差异，我发现一个特点，只要我提取所有包的完整长度，然后减去 IP 头长度(20)再减去 ICMP 头长度(8)，就能提取出来所谓的 icmp 载荷数据长度

```python
import pyshark
import base64
packets = pyshark.FileCapture('fetus_pcap.pcap', display_filter='icmp.type==8')
flag = []
for i, packet in enumerate(packets):
    ip_len = int(packet.ip.len)
    icmp_data_len = ip_len - 20 - 8
    flag.append(icmp_data_len)
    print(f"包{i+1}: IP长度={ip_len}, ICMP数据长度={icmp_data_len}, ASCII='{chr(icmp_data_len)}'")
print("\n=== 提取的ASCII值 ===")
print("数值:", flag)
chars = [chr(num) for num in flag]
result = ''.join(chars)
print("字符串:", result)
try:
    decoded = base64.b64decode(result)
    print("Base64解码:", decoded.decode('utf-8'))
except Exception as e:
    print(f"Base64解码失败: {e}")
```

### FTP

也没有什么要说的，如果单纯想要提取文件，那么就去`文件->导出对象->FTP-DATA...`

如果想要查看 ftp 相关命令历史记录，在 wireshark/tshark 中，过滤的时候，建议使用

```bash
ftp-data || ftp
```

### DNS

:::download{file="/files/ctfnaxieshi/DNS.pcap" title="DNS.pcap附件" description="这个题和dns协议有点关系"}
:::

这是和域名查询有关系的，一般来说，出题人爱出一些给子域名增加编码那样的题目，就比如这样

<img src="/img/tshark/image-20260207193859703.png" alt="image-20260207193859703" style="zoom:50%;" />

我用的过滤规则是

```bash
dns.flags.response==0&& ip.dst==192.168.191.129 && !icmp
```

原因是，我发现本题中有用的流量包都是查询子域名的 A 记录，然后我只显示 DNS 查询请求，不要响应，那个 ip.dst 自然是流量包中看到的，至于那个!icmp，我前面描述过，它是用来判定主机是否存活的，不过滤的话，会出现大量 icmp 错误回显

```bash
tshark -r DNS.pcap -Y "dns.flags.response == 0 && ip.dst == 192.168.191.129 && \!icmp" -T fields -e dns.qry.name > result.log
```

接下来去重提取解码即可

```python
import binascii
import base64
with open('result.log','r') as f:
    data=f.read()
lines=data.strip().split('\n')
seen=set()

hex_parts=[]
for line in lines:
    line=line.strip()
    if not line:
        continue
    if '.192.168.191.129' in line:
        hex_part=line.split('.')[0]
        if hex_part not in seen:
            seen.add(hex_part)
            hex_parts.append(hex_part)

print(f"Extracted {len(hex_parts)} hex parts")
combined=''.join(hex_parts)
result=base64.b64decode(binascii.unhexlify(combined))
print(f"Decoded result:{result}")
```









