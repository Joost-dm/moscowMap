<template>
  <div>
    <map-moscow></map-moscow>
  </div>
</template>

<script>

import MapMoscow from '@/components/MapMoscow.vue'

export default {
  name: 'Home',
  components: {
    'map-moscow': MapMoscow
  }
}
</script>
