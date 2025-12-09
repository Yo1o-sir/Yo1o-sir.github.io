---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
---

<div class="about-page">
  <div class="about-header">
    <div class="about-avatar-wrapper">
      <img src="/assets/img/avatars/Yolo.jpg" alt="Yolo" class="about-avatar">
    </div>
    <h1 class="about-name">Yolo</h1>
    <p class="about-subtitle">Network Security Enthusiast</p>
    <div class="about-social">
      {% for entry in site.data.contact %}
        {% case entry.type %}
          {% when 'github' %}
            {%- capture url -%}
              https://github.com/{{ site.github.username }}
            {%- endcapture -%}
          {% when 'email' %}
            {% assign email = site.social.email | split: '@' %}
            {%- capture url -%}
              javascript:location.href = 'mailto:' + ['{{ email[0] }}','{{ email[1] }}'].join('@')
            {%- endcapture -%}
          {% when 'rss' %}
            {% assign url = '/feed.xml' | relative_url %}
          {% else %}
            {% assign url = entry.url %}
        {% endcase %}
        {% if url %}
          <a href="{{ url }}" 
             aria-label="{{ entry.type }}"
             {% unless entry.noblank %}target="_blank" rel="noopener noreferrer"{% endunless %}
             class="about-social-link">
            <i class="{{ entry.icon }}"></i>
          </a>
        {% endif %}
      {% endfor %}
    </div>
  </div>

  <div class="about-stats">
    {% assign post_count = site.posts | size %}
    {% assign tag_count = site.tags | size %}
    {% assign category_count = site.categories | size %}
    
    <div class="about-stat-item">
      <div class="about-stat-number" data-count="{{ post_count }}">0</div>
      <div class="about-stat-label">文章</div>
    </div>
    {% if category_count > 0 %}
    <div class="about-stat-item">
      <div class="about-stat-number" data-count="{{ category_count }}">0</div>
      <div class="about-stat-label">分类</div>
    </div>
    {% endif %}
    {% if tag_count > 0 %}
    <div class="about-stat-item">
      <div class="about-stat-number" data-count="{{ tag_count }}">0</div>
      <div class="about-stat-label">标签</div>
    </div>
    {% endif %}
  </div>

  <div class="about-content">
    <div class="about-card">
      <h2><i class="fas fa-user-graduate"></i>关于我</h2>
      <div class="about-card-content">
        <p>Yolo，南京邮电大学大二学生，热爱网络安全，乐于分享知识，希望能启发他人。</p>
        <p>在这个博客中，我会分享我在网络安全学习过程中的心得体会、技术总结和有趣发现。希望通过文字记录成长，也希望能帮助到同样热爱技术的朋友们。</p>
      </div>
    </div>

    <div class="about-card">
      <h2><i class="fas fa-code"></i>技能标签</h2>
      <div class="about-skills">
        <span class="about-skill-tag">网络安全</span>
        <span class="about-skill-tag">渗透测试</span>
        <span class="about-skill-tag">Web安全</span>
        <span class="about-skill-tag">CTF</span>
        <span class="about-skill-tag">Python</span>
        <span class="about-skill-tag">Linux</span>
        <span class="about-skill-tag">Docker</span>
        <span class="about-skill-tag">Misc</span>
      </div>
    </div>

    <div class="about-card">
      <h2><i class="fas fa-heart"></i>座右铭</h2>
      <blockquote class="about-quote">
        <p>目前还很菜呢，一起努力哈(ง •_•)ง</p>
      </blockquote>
    </div>

    <div class="about-card">
      <h2><i class="fas fa-graduation-cap"></i>教育背景</h2>
      <div class="about-timeline">
        <div class="about-timeline-item">
          <div class="about-timeline-dot"></div>
          <div class="about-timeline-content">
            <div class="about-timeline-year">2024 - 至今</div>
            <div class="about-timeline-title">南京邮电大学</div>
            <div class="about-timeline-desc">信息安全专业</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  // 数字计数动画
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    if (isNaN(target) || target <= 0) {
      element.textContent = '0';
      return;
    }
    
    const duration = 2000; // 2秒
    const step = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }

  // 使用 Intersection Observer 来触发动画
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numberElement = entry.target.querySelector('.about-stat-number');
          if (numberElement && !numberElement.classList.contains('animated')) {
            numberElement.classList.add('animated');
            animateCounter(numberElement);
          }
        }
      });
    }, { threshold: 0.5 });

    // 观察所有统计项
    document.querySelectorAll('.about-stat-item').forEach(item => {
      observer.observe(item);
    });
  } else {
    // 降级方案：直接执行动画
    document.querySelectorAll('.about-stat-number').forEach(el => {
      animateCounter(el);
    });
  }
})();
</script>