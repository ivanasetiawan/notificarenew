{for post in posts}

{if post.applicationKey == 'faae31f637f4da47d29ad39941b097b1b5c144e9e8ba26bd71ecb6b550c07616'}
<article class="latestpost">
	<header>
		<h3>{if post.data.link}<a href="${post.data.link}" class="external">${post.data.message}</a>{else}${post.data.message}{/if}</h3>
		<div class="author-pic">
			<img src="/images/facebook-post.png" alt="">
		</div>
	</header>
</article>
{else}
<article class="latestpost">
	<header>
		<h3>${post.data.text}</h3>
		<div class="author-pic">
			<img src="/images/twitter-post.png" alt="">
		</div>
	</header>
</article>
{/if}

{/for}
