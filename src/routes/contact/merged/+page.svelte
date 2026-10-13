<script lang="ts">
  import MergedCard from '$components/contact/MergedCard.svelte'
</script>

<!--
  Where the contact form lands when it was submitted without JavaScript (a
  plain form POST that /api/contact answers with a redirect). With
  JavaScript the form turns into the same card in place and never comes here.
-->
<svelte:head>
  <title>Pull request merged | Pranta Dutta</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="container-page page">
  <MergedCard />
</div>

<style>
  .page {
    max-width: calc(720px + 2 * var(--gutter));
    padding-top: 40px;
    padding-bottom: 48px;
  }
</style>
