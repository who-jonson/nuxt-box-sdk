<script setup lang="ts">
import { watchEffect, useBoxUsersManager } from '#imports';

const { data: user } = await useBoxUsersManager().withAsyncData().getUserMe();

watchEffect(() => {
  console.log(user.value);
  // console.log(useBoxFilesManager(), useBoxClient().users);
});
</script>

<template>
  <div>
    Nuxt module playground!
  </div>
</template>
