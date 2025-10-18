---
layout: post
title: Just a wastepaperbasket
date: 2025-10-18 17:52 +0800
categories: notes
tags: Dictionary
description: a note about how to use chirpy blog
image: /assets/img/backgrounds/by_my_self.png
---
# 废纸篓

> 就记录一堆使用记录了

部署博客到GitHub仓库的时候，要使用下述命令

```
git add .
git commit -m "renew"
git push
```

挺好的一点是，我用wsl2挂载到blog所在文件夹处，使用下面命令，可以做到本地调试，调试好了就push

```bash
bundle exec jekyll serve --host 0.0.0.0 --force_polling
```

然后使用浏览器访问`http://127.0.0.1:4000`，就可以看到效果了

同样是在wsl2下面，有几个好用命令
> 我用到的时候再补充吧

参考仓库链接https://github.com/jekyll/jekyll-compose

```bash
$ bundle exec jekyll page "My New Page" #可以新建页面
$ bundle exec jekyll draft "My draft"	#会创建草稿
$ bundle exec jekyll publish "My draft" #会将草稿发布
$ bundle exec jekyll unpublish "My New Post" #会将发布的文章放到草稿里面
```
> Add Markdown syntax content to file `这个有点东西`{: .filepath } and it will show up on this page.
{: .prompt-tip }
