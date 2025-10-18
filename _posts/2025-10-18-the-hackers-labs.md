---
layout: post
title: the hackers labs notes
date: 2025-10-12 14:16 +0800
categories: 
  - permeation
tags: 
  - the hackers labs
image: /assets/img/backgrounds/thehackerslabs.png
---


> From now , I'm diving into stuff that actually fires me up - no more "shoulds," just pure curiosity.

# Tortuga

> **提示:** 靶机跳转传送门
[Tortuga](https://labs.thehackerslabs.com/machines/131)

<img src="/assets/img/thehackerslabs-notes/20251012150814_008.webp" alt="image-20251012143004040" style="zoom:50%;" />

## 信息搜集

![img](/assets/img/thehackerslabs-notes/20251012150813_000.webp)

扫端口，发现22和80，简单访问下80端口

下面两个php文件，dirsearch爆破过其他路径，也失败了，接下来就看看能不能走参数

翻译了下这个`mapa.php`路由，感觉上是让我找文件，然后就爆破参数名的时候，不能把目标文件写我们测试的`mapa.php`，目前来看，`index.html`，`tripulacion.php`文件都可以

![img](/assets/img/thehackerslabs-notes/20251012150813_001.webp)

用burp爆破攻击就好了，发现参数名就是filename

![img](/assets/img/thehackerslabs-notes/20251012150813_002.webp)

look here,这是`http://10.161.253.201/mapa.php?filename=tripulacion.php`的结果，两个文件都显示出来了
> **警告:** 不能执行filename=mapa.php的原因是这会导致php无限递归包含，最后达到memory_limit后触发HTTP 500 Internal Server Error给我们，对我来说这个解释应该是没问题了


![img](/assets/img/thehackerslabs-notes/20251012150813_003.webp)

然后我们尝试/etc/passwd,可惜失败了，但是发现双写后就没有问题，可以进行路径穿越

![img](/assets/img/thehackerslabs-notes/20251012150813_004.webp)

但是只能本地进行路径穿越，我也拿不到shell，回到那个mapa.php，会发现他们加粗了用户名grumete，正好这个也是/etc/passwd上面出现的用户，接下来需要考虑ssh弱密码爆破了

![img](/assets/img/thehackerslabs-notes/20251012150813_005.webp)

成功爆破出来，拿到了userflag

读取那个.nota.txt，拿到了capitan的登录密码`mar_de_fuego123`（实质上这一步可以不用

暂时回到web服务，我看看，确认了，我前面的操作都没问题

![img](/assets/img/thehackerslabs-notes/20251012150813_006.webp)

## 提权

然后想办法提权root

通过linepeas，掌握了新的技能

![img](/assets/img/thehackerslabs-notes/20251012150814_007.webp)

```bash
capitan@TheHackersLabs-Tortuga:~$ /sbin/getcap -r / 2>/dev/null
/usr/bin/ping cap_net_raw=ep
/usr/bin/python3.11 cap_setuid=ep
capitan@TheHackersLabs-Tortuga:~$ 
```

这里的`cap_setuid`能力集相较平时提权用的`suid`更厉害， 就是说它能分配`setuid(),setgid(),setresuid()`等特殊权限功能

```bash
capitan@TheHackersLabs-Tortuga:~$ /usr/bin/python3.11 -c 'import os; os.setuid(0); os.system("/bin/bash")'
root@TheHackersLabs-Tortuga:~# cat /root/root.txt
c???????????????????????????ae
```























