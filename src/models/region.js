import Point from '@/models/point'
export default class Region {
  constructor(region, map, geometry=region.geometry) {
    this.name = region.properties.NAME
    this.color = region.options.fillColor
    this.map = map
    this.coords = geometry.coordinates
    this.weight = null
    this.points = []
    this.geo = new ymaps.GeoObject({
        geometry: geometry,
        properties: region.properties
      }, {
        fillColor: region.options.fillColor,
        strokeColor: '#414141',
        opacity: 0.5,
        strokeWidth: 2,
        strokeStyle: 'solid'
      });
    this.maxX = 0
    this.maxY = 0
    this.minX = 100
    this.minY = 100
    this.limits()
  }
  contains(coords) {
    return this.geo.geometry.contains(coords)
  }
  display() {
    this.map.geoObjects.add(this.geo)
  }
  hide() {
    this.map.geoObjects.remove(this.geo)
  }
  limits() {
    this.coords.forEach(coord => {
      coord.forEach((pair) => {
        if (pair[0] > this.maxX) {
          this.maxX = pair[0]
        } else if (pair[0] < this.minX) {
          this.minX = pair[0]
        }
        if (pair[1] > this.maxY) {
          this.maxY = pair[1]
        } else if (pair[1] < this.minY) {
          this.minY = pair[1]
        }
      })
    })
    this.weight = ((this.maxX - this.minX) * (this.maxY - this.minY) * 1000).toFixed(5)
  }
  generateRandomPoint() {
    var done = false
    while ( done === false ) {
      var x = (Math.random() * (this.maxX - this.minX) + this.minX).toFixed(5)
      var y = (Math.random() * (this.maxY - this.minY) + this.minY).toFixed(5)
      if (this.contains([x, y])) {
        done = true
        const point = new Point([x, y], this)
        this.points.push(point)
        point.display()
      }
    }
  }
  clearPoints() {
    this.points.forEach(point => {
      point.hide()
    })
    this.points = []
  }
}
