<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n({ useScope: 'global' });

const selectedLang = ref(1);

const languages = ref([
  { id: 1, title: "Русский", code: 'ru' },
  { id: 2, title: "Английский", code: 'en' },
  { id: 3, title: "Узбекский", code: 'uz' },
]);

const switchLang = (langCode) => {
  locale.value = langCode;
  localStorage.setItem('lang', locale.value);
};

watch(selectedLang, (newVal) => {
  const selectedLanguage = languages.value.find(lang => lang.id === newVal);
  if (selectedLanguage) {
    switchLang(selectedLanguage.code);
  }
});

const initialLang = localStorage.getItem('lang');
if (initialLang) {
  const initialLanguage = languages.value.find(lang => lang.code === initialLang);
  if (initialLanguage) {
    selectedLang.value = initialLanguage.id;
    locale.value = initialLang;
  }
}
</script>

<template>
  <div>
    <v-col>
      <div class="w-25">
        <v-autocomplete
          style="max-width: 50%; min-width: 50%"
          variant="outlined"
          hide-details
          label="Язык"
          rounded="lg"
          v-model="selectedLang"
          :items="languages"
          item-title="title"
          item-value="id"
        />
      </div>
    </v-col>
  </div>
</template>
