<script lang="ts">
  import ContactForm from '$components/ContactForm.svelte'
  import SectionHeading from '$components/SectionHeading.svelte'
  import SectionMarker from '$components/SectionMarker.svelte'
  import SectionSubheading from '$components/SectionSubheading.svelte'
</script>

<section id="contact" class="section-spacing-sm relative scroll-mt-28">
  <SectionMarker section="Contact" threshold={0.3} />

  <div
    class="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block"
  >
    <div
      class="from-primary-400/10 to-secondary-400/10 absolute top-1/4 left-1/4 h-72 w-[18rem] rounded-full bg-linear-to-br opacity-70 blur-2xl"
    ></div>
    <div
      class="from-secondary-400/10 to-accent-400/10 absolute right-1/4 bottom-1/4 h-64 w-[16rem] rounded-full bg-linear-to-br opacity-60 blur-xl"
    ></div>
  </div>

  <div class="content-container mx-auto max-w-2xl text-center">
    <SectionHeading>Contact Me</SectionHeading>
    <SectionSubheading>
      Looking for a developer? Let's build something great together.
    </SectionSubheading>

    <div class="mt-8 space-y-6 text-gray-700 dark:text-gray-200">
      <p>
        Reach me directly at <a
          class="text-gradient hover:text-gradient-accent font-semibold transition-colors duration-300"
          href="mailto:prantadutta1997@gmail.com">prantadutta1997@gmail.com</a
        > or use the form below.
      </p>

      <div
        class="mx-auto inline-flex items-center gap-2 rounded-2xl border border-green-200 bg-white/50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-gray-900/40 dark:text-green-400"
      >
        <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
        Available for hire
      </div>
    </div>

    <div class="mt-10">
      <ContactForm />
    </div>
  </div>
</section>
