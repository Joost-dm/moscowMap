export default class Point {
  constructor(coords, region) {
    this.name = coords
    this.region = region
    this.map = region.map
    this.geo = new ymaps.Placemark(coords, {
          balloonContent: this.name
        }, {
          preset: 'islands#dotIcon',
          iconColor: '#3caa3c'
        })
  }
  display() {
    this.map.geoObjects.add(this.geo)
  }
  hide() {
    this.map.geoObjects.remove(this.geo)
  }
}
