<template>
  <div class="moscow-map">
    <div class="moscow-map__chart" ref="chartdiv"></div>
    <v-btn class="moscow-map__refresh_button" @click="generateRandomPoints(100)">Сгенерировать</v-btn>
    <div id="map" class="moscow-map__map"></div>
  </div>
</template>

<script>
import * as axios from 'axios'
import Region from '@/models/region'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'


export default {
  name: 'MapMoscow',
  data: () => ({
    map: null,
    regionsJson: null,
    regions: [],
    loading: false,
    chartData: [],
    activeSliceName: null
  }),
  methods: {
    yandexMapsInitialization () {
      this.map = new ymaps.Map('map', {
        center: [ 37.64, 55.76],
        zoom: 10
      })
      this.map.layers.add(new ymaps.Layer('http://tile.openstreetmap.org/%z/%x/%y.png', {
        projection: ymaps.projection.sphericalMercator
      }));
      this.map.copyrights.add('&copy; OpenStreetMap contributors, CC-BY-SA')
    },
    async getRegionsJson () {
      const regionsJson = await axios.get('https://api.jsonbin.io/b/5f5c0870ad23b57ef9107157/8',
        { headers: { 'secret-key': '$2b$10$f80fXx031oddADsAPOtLbOfaINvWiQ8TIeHrK.dl4QnE6CTKyFKgG' } }
      )
      this.regionsJson = regionsJson.data
      this.GeoJsonHandler()
    },
    GeoJsonHandler () {
      this.regionsJson.features.forEach(region => {
        if (region.geometry.type === "Polygon") {
          const reg = new Region(region, this.map);
          this.regions.push(reg)
          reg.display()
        } else if (region.geometry.type === "MultiPolygon") {
          region.geometry.coordinates.forEach(coords => this.addMultiPolygonPartToMap(coords, region));
        }
      })
      this.generateRandomPoints(100)
    },
    addMultiPolygonPartToMap (coords, region) {
      const reg = new Region(region, this.map, {'type': 'Polygon', 'coordinates': coords});
      this.regions.push(reg)
      reg.display()
    },
    clearAllPoints () {
      this.regions.forEach(region => {
        region.isActive = false
        region.clearPoints()
      })
    },
    generateRandomPoints (value) {
      this.clearAllPoints()
      var i = 0
      var grossweight = 0
      this.regions.forEach(region => {
        region.display()
        region.rangeFrom = grossweight.toFixed(5)
        grossweight += parseFloat(region.weight)
        region.rangeTo = grossweight.toFixed(5)
      })
      while (i < value) {
        const randomValue = (Math.random() * grossweight);
        this.regions.forEach(region => {
          if (randomValue <= region.rangeTo && randomValue >= region.rangeFrom) {
            region.generateRandomPoint()
          }
        })
        ++i
      }
      this.generateChartData()
    },
    generateChartData () {
      const chartData = [];
      const combinedRegions = new Map;
      this.regions.forEach(region => {
        if (combinedRegions.has(region.name)) {
          const value = combinedRegions.get(region.name);
          value.points += region.points.length
          combinedRegions.set(region.name, value)
        } else {
          combinedRegions.set(region.name, { region: region.name, points: region.points.length, color: region.color })
        }
      })
      for (let value of combinedRegions.values()) {
        chartData.push(value)
      }
      this.chartData = chartData
      this.chartHandler()
    },
    chartHandler () {
      const chart = am4core.create(this.$refs.chartdiv, am4charts.PieChart)
      chart.hiddenState.properties.opacity = 0
      chart.data = this.chartData
      chart.innerRadius = am4core.percent(40)
      chart.depth = 120
      chart.legend = new am4charts.Legend()
      const series = chart.series.push(new am4charts.PieSeries())
      series.dataFields.value = 'points'
      series.dataFields.depthValue = 'points'
      series.dataFields.category = 'region'
      series.slices.template.cornerRadius = 3
      series.colors.step = 3
      series.slices.template.events.on('hit', this.sliceClickHandler)
    },
    sliceClickHandler (event) {
      const sliceName = event.target.slice.dataItem._dataContext.region
      let activeCounter = 0
      this.regions.forEach(region => {
        if ((region.name !== sliceName && !region.isActive) || (region.name === sliceName && region.isActive)) {
          region.isActive = false
          region.hide()
          region.points.forEach(point => {
            point.hide()
          })
        } else if (region.name === sliceName && !region.isActive) {
          this.activeSliceName = sliceName
          region.isActive = true
          region.display()
          region.points.forEach(point => {
            point.display()
          })
        }
        if (region.isActive) {
          activeCounter++
        }
      })
      if (activeCounter === 0) {
        this.regions.forEach(region => {
          region.display()
          region.points.forEach(point => {
            point.display()
          })
        })
      }
    }
  },
  async created () {
    await this.getRegionsJson()
  },
  async mounted () {
    await ymaps.ready(this.yandexMapsInitialization)
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.dispose()
    }
  }
}
</script>
<style scoped>
.moscow-map {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}
.moscow-map__chart {
  width: 100%;
  height: 40%;
  font-size: 12px;
}
.moscow-map__map {
  width: 100%;
  height: 60%;
}
</style>
