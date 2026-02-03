---
title: BUU刷题小记-crypto
link: buu-shua-ti-xiao-ji-crypto
date: 2026-02-03 21:47:24
description: 该学点密码了...
tags:
  - Crypto
categories:  
  - [笔记,密码]

cover: /img/cover/buuctf.png
---



# BUU 刷题小记——Crypto

> 这学期把密码给挂了，这个假期多刷刷密码题吧，对下学期的重考有帮助

## 一眼就解密

一眼就是`base64`编码，还是用`python`手写解密好了

```bash
>>> import base64
>>> cipher="ZmxhZ3tUSEVfRkxBR19PRl9USElTX1NUUklOR30="
>>> print(base64.b64decode(cipher).decode('utf-8'))
flag{THE_FLAG_OF_THIS_STRING}
```

## MD5

感觉这个就是找个 cmd5 网站进行解密

<img src="/img/buuctf/image-20260201112531656.png" alt="image-20260201112531656" style="zoom:50%;" />

## Url 编码

ez

```bash
>>> from urllib.parse import unquote
>>> encoded_url="%66%6c%61%67%7b%61%6e%64%20%31%3d%31%7d"
>>> print(unquote(encoded_url))
flag{and 1=1}
```

## 看我回旋踢

看出来是凯撒加密，首字母是 s 想要回到 f 就得向前偏移 13 个

```python
>>> def caesar(text,shift):
...     result=""
...     for char in text:
...         if char.isalpha():
...             if char.isupper():
...                 base=ord('A')
...                 decrypted_char=chr((ord(char)-base-shift)%26+base)
...             else:
...                 base=ord('a')
...                 decrypted_char=chr((ord(char)-base-shift)%26+base)
...             result+=decrypted_char
...         else:
...             result+=char
...     return result
... encrypted_text="synt{5pq1004q-86n5-46q8-o720-oro5on0417r1}"
... decypted_text=caesar(encrypted_text,13)
... print(decypted_text)
... 
flag{5cd1004d-86a5-46d8-b720-beb5ba0417e1}

```

## 摩丝

用 python 写莫斯密码映射好麻烦，直接用`cyberchef`处理了

<img src="/img/buuctf/image-20260201115106059.png" alt="image-20260201115106059" style="zoom:50%;" />

## password

> 莫名其妙

参考网上的 wp，是让我猜想对应的 key，没想到是姓名首字母加生日，神人题目

```plain
key{zs19900315}
```

## 变异凯撒

观察下密文规律，a->f，需要向后偏移 5 个；f->l 需要向后偏移 6 个，以此类推，最后可以恢复出 flag

```python
cipher="afZ_r9VYfScOeO_UL^RWUc"
result=""
shift=5
for char in cipher:
    new_char = chr(ord(char) + shift)
    result += new_char
    shift += 1
print("decoded:", result)
#flag{Caesar_variation}
```

## Quoted-printable

一种叫做`quoted-printable`的编码，emm，直接`cyberchef`解密吧，这个写脚本估计会很麻烦

<img src="/img/buuctf/image-20260201133224632.png" alt="image-20260201133224632" style="zoom:50%;" />

`flag{那你也很棒哦}`

## 篱笆墙的影子

这个看名字，很像栅栏密码，得研究分组

```text
felhaagv{ewtehtehfilnakgw}
```

一共 26 个字符，然后结合 flag 头，可以把它两两一组，分成 13 组

```python
cipher="felhaagv{ewtehtehfilnakgw}"
n=len(cipher) #0-25

cow1=[]
n=0
for i in range(13):
    cow1.append(cipher[n])
    n+=2
cow2=[]
n=1
for i in range(13):
    cow2.append(cipher[n])
    n+=2
print("".join(cow1+ cow2))
#flag{wethinkwehavetheflag}
```

## Rabbit

<img src="/img/buuctf/image-20260201140504861.png" alt="image-20260201140504861" style="zoom:50%;" />



看了下 rabbit 加密逻辑，应该需要密码或 IV 的，但是这道题好像只能是工具题目了

