---
title: pragyan ctf
link: pragyan-ctf
date: 2026-02-07 21:27:12
description: 挺无聊的，来看看老外的ctf
tags:
  - pragyanctf
categories:
  - CTF
draft: true
---

# PragyanCTF

> 蛮无聊的，过来看看老外的 ctf，图寻孩子懒得翻了，看看其他方向

## FORENSICS

### Plumbing

第一次做 docker 容器取证（至少我是第一次对 docker 打包的 tar 进行解压

正常来说，docker 的 image.tar 的内部结构如下

```text
image.tar
└── manifest.json
└── index.json
└── oci-layout
└── blobs/
    └── sha256/
        ├── aaaaaa...
        ├── bbbbbb...
        ├── cccccc...

```

其中各个文件的作用如下

- oci-layout:内容一般会固定为`{"imageLayoutVersion":"1.0.0"}`作用只是声明这是 OCI 标准格式，没有别的意义

- index.json:OCI 镜像入口索引，一个 tar 里可能包含多个 image manifest。index.json 负责将 tag（如 app:latest）映射到具体的 manifest digest

  ```json
  {"schemaVersion":2,"mediaType":"application/vnd.oci.image.index.v1+json","manifests":[{"mediaType":"application/vnd.oci.image.index.v1+json","digest":"sha256:b04464d224e09249c70ed0e60c31ecff9c913d4a7bc1c30dadcdcdd67a7117a5","size":856,"annotations":{"io.containerd.image.name":"docker.io/library/app:latest","org.opencontainers.image.ref.name":"latest"}}]}{"schemaVersion":2,"mediaType":"application/vnd.oci.image.index.v1+json","manifests":[{"mediaType":"application/vnd.oci.image.index.v1+json","digest":"sha256:b04464d224e09249c70ed0e60c31ecff9c913d4a7bc1c30dadcdcdd67a7117a5","size":856,"annotations":{"io.containerd.image.name":"docker.io/library/app:latest","org.opencontainers.image.ref.name":"latest"}}]}
  ```

- mainifest.json:这才是真正的目录树，基本作用是定义镜像=Config+按顺序叠加这些 layer

  ```json
  [{"Config":"blobs/sha256/b3f4caf17486575f3b37d7e701075fe537fe7c9473f38ce1d19d769ea393913d","RepoTags":["app:latest"],"Layers":["blobs/sha256/1733a4cd59540b3470ff7a90963bcdea5b543279dd6bdaf022d7883fdad221e5","blobs/sha256/9fd9e26f8f287696571eb98b5e10e91211abbc4dd5918c5a2f50d1b697191540","blobs/sha256/004f0aa18a079de0973edc8a53f2397b4fe498cc595e21fb32ab01c89eb00a70","blobs/sha256/7bceabe27cdff3949f8ad5eb4db394db5850a5fbc33e0371b4d621298ef7ccb1","blobs/sha256/99bb3690467c4da195f1d336a1032fd64639cda9a6e719816d049d680d761d38","blobs/sha256/dfdedb04feee56ffcdb294dc2a710e152bfa8a90c5534a00b03c59e8cc2af85d","blobs/sha256/cfb8fcdc3104009c23e8b7f0d27bdaf51734a58786bd651e53df1782f714b1f0","blobs/sha256/123c3d8705680f885b8ef1ddac4d82686850e8c8e57a7a81f8ff8e55f4b44ac4","blobs/sha256/aeeab7a6f9f61a642c7ccccd3585617279943e0e84964e76caeaea20dd8446fd","blobs/sha256/d577b2611579eace74917fd7c1421f8a8031695ef97eafc4c3df196144302e77","blobs/sha256/234d56f45b44816c8eadd9882decbe45dc5b1c7042b42b94cd5f04399943036f","blobs/sha256/faabb23a872c8e0a3beb0763e3f7bf567cd5a5cb8e07732b224a82913d85a617"]}]
  ```

- blobs/sha256/*:这是真正的硬盘，小一点的文件是 config，一般就几 KB，是 JSON 格式，大一点的文件就是 layer，它们是 gzip 格式，这一堆文件都靠 hash 串起来，emm，具体参考上面的那个 manifest.json

针对本题，可以直接查看 config

```bash
cat blobs/sha256/b3f4caf17486575f3b37d7e701075fe537fe7c9473f38ce1d19d769ea393913d | grep ctf
#p_ctf{d0ck3r_l34k5_p1p3l1n35}
```

### epstein files

这个题目感觉好难，等会儿继续分析

### $whoami

这个流量题看样子应该就是恢复出来 ntlm 哈希然后进行爆破了，但是有个很严重的问题，我的 rockyou 爆破不出来，服了

### H@rDl4u6H

这个题也有点抽象，给了一个 github 链接，然后没了
