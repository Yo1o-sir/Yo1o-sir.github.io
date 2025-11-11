---
layout: post
title: wsl2网络配置小记：让靶机直接回连wsl2，告别kali中转
date: 2025-11-11 19:27 +0800
categories: notes
tags: Dictionary
image: /assets/img/backgrounds/wsl_connect_virtualbox.jpg
---

## 为什么写这篇文章？

平时打靶机，我习惯在 **WSL2（Ubuntu 24.04）** 中完成大部分操作。  
但到了关键一步——**反弹 Shell**——却总要绕个弯：  
❌ 先切回 VirtualBox → 启动 Kali（桥接模式）→ 在 Kali 里监听端口 → 等靶机回连。

多此一举？是的。  
**根本原因**：WSL2 默认是 NAT 模式，对外“隐形”，靶机根本 ping 不通它。

在 Qwen 老师的帮助下，我终于实现了 **靶机 → WSL2 直连**，彻底甩掉 Kali 中转环节！  
为防日后遗忘/帮到同路人，特记此文。

## 如何操作

在管理员模式的powershell中，输入下述命令回车

```bash
notepad "$env:USERPROFILE\.wslconfig"
```

我们只需要编辑这些内容

<img src="/assets/img/2025-11-11-make-virtual-machine-to-ping-wsl2.assets/image-20251111194216717.png" alt="image-20251111194216717" style="zoom:50%;" />

```yaml
[wsl2]
networkingMode=mirrored
dnsTunneling=false
firewall=true
autoProxy=true
```

稍微解析下这些配置

- `networkingMode=mirrored`启用“镜像网络”模式，可以直接复用Windows主机的物理网络接口，有个要求，就是系统需要Win11 22H2或更高；WSL 内核 ≥ 5.15
- `dnsTunneling=false`关闭DNS隧道，这样就是让网络通畅了一些，对整体帮助不大
- `firewall=true`启用WSL2内置防火墙，算是给本地wsl2配置了第二层防火墙，也是蛮重要的，但是对于我们后面虚拟机pingwsl2作用不大
- `autoProxy=true`自动同步Windows代理设置，这个很关键，我们本地挂梯子的时候，为了让wsl2能正常上网，必须开启autoProxy

接下来重启一次wsl2，就over了

```
wsl --shutdown
wsl
```

哈哈，真over了吗，可惜,还卡到一个关键点

```bash
❯ ip -br addr show up
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth1             UP             10.161.167.59/17
loopback0        UP
br-c0138d06a613  DOWN           172.19.0.1/16
br-ddc8cb337f5c  UP             172.20.0.1/16
br-11d709b86344  DOWN           172.18.0.1/16
br-6eada2980fec  UP             172.22.0.1/16
br-a67fcf4a3b08  UP             172.21.0.1/16
docker0          UP             172.17.0.1/16
vethdf3974e@if2  UP
veth562eced@if2  UP
vethf98c3b7@if2  UP
vethafd2d3f@if2  UP
```

look here，eth1网卡设备出现了我想要的10.161.xxx.xxx设备，but,我在虚拟机中ping不到这个10.161.167.59的，Qwen老师指导我，这里应该出现了防火墙规则的问题，可以尝试使用下面这个命令进行测试

```bash
Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled False
```

作用是将Windows中的防火墙暂时关闭，这会儿我们再ping就ping通了

```bash
relox@thehackerslabs-watchstore:~$ ping 10.161.167.59
PING 10.161.167.59 (10.161.167.59) 56(84) bytes of data.
^C
--- 10.161.167.59 ping statistics ---
59 packets transmitted, 0 received, 100% packet loss, time 59375ms


relox@thehackerslabs-watchstore:~$ ping 10.161.167.59
PING 10.161.167.59 (10.161.167.59) 56(84) bytes of data.
64 bytes from 10.161.167.59: icmp_seq=1 ttl=128 time=1.64 ms
64 bytes from 10.161.167.59: icmp_seq=2 ttl=128 time=0.871 ms
^C
--- 10.161.167.59 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 0.871/1.255/1.640/0.384 ms

```

那好，问题基本解决，但是每次手动关闭防火墙，查找分配IP，这些操作还是不够方便，就写了个脚本

```bash
❯ cat .config/wsl/firewall-sync.sh
#!/bin/bash

# --- 脚本：WSL2 动态网络配置和防火墙同步（最终版）---
# 目标：解决 WSL2 镜像网络下的 IP 动态性、Windows 防火墙和 Public 网络类别问题。

echo "--- 🚀 正在启动 WSL2 网络环境配置 ---"

# 1. 动态查找 WSL2 的主网络接口 IP
# 策略：通过查找默认路由（default route）来确定正在使用的接口，然后获取其 IP。

# 获取默认路由指向的接口名称 (e.g., eth0, eth1, etc.)
DEFAULT_INTERFACE=$(ip route show default 2>/dev/null | awk '/default/ {print $5}' | head -n 1)

if [ -z "$DEFAULT_INTERFACE" ]; then
    echo "⚠️ 错误：未检测到 WSL2 内部的默认路由。请确保网络连接正常且 .wslconfig 已生效。"
    exit 1
fi

# 获取该接口的 IPv4 地址
WSL_IP=$(ip -4 addr show dev "$DEFAULT_INTERFACE" 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1)

if [[ -z "$WSL_IP" || "$WSL_IP" == "127.0.0.1" ]]; then
    echo "⚠️ 错误：接口 '$DEFAULT_INTERFACE' 未获取到有效的镜像 IP。请检查网络配置。"
    exit 1
fi

echo "✅ 步骤 1: 成功检测到主接口 '$DEFAULT_INTERFACE'，IP: $WSL_IP"

# 2. 调用 Windows PowerShell 进行配置
powershell.exe -Command "
Set-ExecutionPolicy Bypass -Scope Process -Force;
& {
    # ----------------------------------------------------
    # A. 动态同步 Windows 防火墙规则 (放行端口和 Ping)
    # ----------------------------------------------------
    \$ruleNameTCP = 'WSL2-Hacking-TCP';
    \$ruleNameICMP = 'WSL2-Hacking-ICMP';

    Write-Host \"\n--- 步骤 2: 正在同步 Windows 防火墙规则 ---\" -ForegroundColor Cyan

    # 1. 删除旧规则（名称匹配）
    Get-NetFirewallRule | Where-Object { \$_.DisplayName -like 'WSL2-Hacking-*' } | Remove-NetFirewallRule -ErrorAction SilentlyContinue | Out-Null;

    # 2. 创建新规则：允许任何地址访问 WSL2 的监听端口 (7777-9000)
    New-NetFirewallRule -DisplayName \"\$ruleNameTCP\" -Direction Inbound -Protocol TCP -LocalPort 7777-9000 -Action Allow -Description 'Auto-generated for WSL2 Reverse Shell Ports' -Profile Any | Out-Null;

    # 3. 创建新规则：允许外部 Ping (ICMP Type 8)
    New-NetFirewallRule -DisplayName \"\$ruleNameICMP\" -Direction Inbound -Protocol ICMPv4 -IcmpType 8 -Action Allow -Description 'Auto ping' -Profile Any | Out-Null;

    Write-Host \"✅ 防火墙已更新：放行 7777-9000/TCP + Ping (ICMP)\" -ForegroundColor Green


    # ----------------------------------------------------
    # B. 动态查找并设置网络连接类别为 Private
    # ----------------------------------------------------
    Write-Host \"\n--- 步骤 3: 正在设置网络类别为 Private ---\" -ForegroundColor Cyan

    # 获取 Windows 主机的网络适配器列表
    \$activeProfiles = Get-NetConnectionProfile | Where-Object {
        # 排除 WSL 内部使用的虚拟网卡和 Hyper-V 桥接网卡
        \$_.InterfaceAlias -notlike '*WSL*' -and
        \$_.InterfaceAlias -notlike '*Hyper-V*' -and
        # 只处理当前是 Public 或 Domain 类别，且不是 Private 的连接
        \$_.NetworkCategory -ne 'Private'
    }

    if (\$activeProfiles.Count -eq 0) {
        Write-Host \"✅ 所有非虚拟网络连接已经是 Private 或未检测到需要修改的活动连接，跳过设置。\" -ForegroundColor Green
    } else {
        foreach (\$profile in \$activeProfiles) {
            \$alias = \$profile.InterfaceAlias;
            \$category = \$profile.NetworkCategory;

            Write-Host \"-> 检测到活动连接 '\$alias'，当前类别为 '\$category'。\" -ForegroundColor Yellow

            try {
                # 尝试将其设置为 Private
                Set-NetConnectionProfile -InterfaceAlias \$alias -NetworkCategory Private -ErrorAction Stop
                Write-Host \"✅ 成功设置连接 '\$alias' 为 Private。\" -ForegroundColor Green
            } catch {
                # 提示用户可能需要更高的权限
                Write-Host \"❌ 错误：无法设置连接 '\$alias' 为 Private。请尝试在**管理员模式的 PowerShell**中手动执行以下命令：\" -ForegroundColor Red
                Write-Host \"   Set-NetConnectionProfile -InterfaceAlias '\$alias' -NetworkCategory Private\" -ForegroundColor Red
            }
        }
    }
}
"

echo "--- 脚本执行完毕 ---"
```

接下来给它配置到profile里面，开启wsl自动执行一次

```bash
❯ chmod +x ~/.config/wsl/firewall-sync.sh
❯ echo "source ~/.config/wsl/firewall-sync.sh 2>/dev/null || true" >> ~/.profile
❯ ~/.config/wsl/firewall-sync.sh #这是我自己测试了一波
📡 检测到 WSL2 IP: 10.161.167.59
✅ 防火墙已更新：放行 10.161.167.59 (7777-9000 + ICMP)
```

可惜，到这里还没解决问题，回到Windows Powershell，看

```bash
PS C:\Yolo\24062> Get-NetFirewallRule | Where DisplayName -like "WSL2-Dynamic*" | ft DisplayName, RemoteAddress, Action


DisplayName                     RemoteAddress Action
-----------                     ------------- ------
WSL2-Dynamic-10.161.167.59                     Allow
WSL2-Dynamic-10.161.167.59-ICMP                Allow


PS C:\Yolo\24062> Get-NetConnectionProfile | ft InterfaceAlias, NetworkCategory

InterfaceAlias NetworkCategory
-------------- ---------------
以太网                  Public

```

我的脚本处理没问题，确实开启的防火墙，但是呢，我电脑默认连接的以太网是public，这样说吧，现在的Windows会自动将连接的网络定义成public，它会自动将连接的新网络当作咖啡厅WIFI对待，非常保守

> 在Public(公用)网络下，Windows防火墙即使有Allow规则，也可能因**「网络保护级别」**被覆盖

解决方案是

```bash
Set-NetConnectionProfile -InterfaceAlias "以太网" -NetworkCategory Private
```

接下来，就完成目标，实现虚拟机能直接ping到wsl2中，实现一步反弹shell

ps:我的脚本已经集成好啦，就是设置private的部分可以不用手动进行，只要把前面的那个.wslconfig写好，然后这个脚本配置好，就over啦

![2b6f6dde837134ff1dfd73fb088eb939](/assets/img/2025-11-11-make-virtual-machine-to-ping-wsl2.assets/2b6f6dde837134ff1dfd73fb088eb939.png)

over!

<img src="/assets/img/2025-11-11-make-virtual-machine-to-ping-wsl2.assets/4f297ef62be67a2700eefcbb83c58381.jpg" alt="4f297ef62be67a2700eefcbb83c58381" style="zoom:50%;" />
