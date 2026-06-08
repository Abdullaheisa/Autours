<template>
  <Editor
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :init="init"
    tinymce-script-src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
  />
</template>

<script setup>
import Editor from '@tinymce/tinymce-vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const init = {
  height: 400,
  menubar: 'file edit view insert format tools table help',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar:
    'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | table | code | help',
  table_toolbar:
    'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
    'tableinsertcolbefore tableinsertcolafter tabledeletecol',
  paste_data_images: true,
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
}
</script>
