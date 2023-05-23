<Sim name="{{ name }}">
<h1>{{ name }}</h1>
{% if introduction %}
<p class="introduction">{{ introduction }}</p>
{% endif %}
{% if toc %}
<h2>Contents</h2>
<ul>
{% for item in toc %}
<li><a href="#{{ item.id }}">{{ item.title }}</a></li>
{% endfor %}
</ul>
{% endif %}
</Sim>
