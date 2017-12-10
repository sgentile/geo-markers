import { Component, ElementRef } from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import * as L from 'leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import * as PixiOverlayWrapper from 'pixi-overlay-markers';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  frenchCities = [];
  map: L.Map;
  colors = ['#FF0000', '#0000FF', '#FFFF00', '#FFA500'];
  pixiOverlayWrapper: PixiOverlayWrapper;
  

  private layersControl: any = null;

  constructor(public http: Http) {}

  ngOnInit(){
    
    this.map = L.map('map').setView([46.953387, 2.892341], 6);
    L.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        subdomains: 'abcd',
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        minZoom: 4,
        maxZoom: 18
    }).addTo(this.map);
    this.map.attributionControl.setPosition('bottomleft');
    this.map.zoomControl.setPosition('bottomright');

    this.pixiOverlayWrapper = new PixiOverlayWrapper(this.map, {
      'white': '/assets/white-marker.png'
    }, {
      minScale: 0,
      maxScale: 5
    });  
  }

  load() {

    if(this.pixiOverlayWrapper.hasLayer('cities')){
      this.pixiOverlayWrapper.removeLayer('cities');
    }
    this.http.get('assets/french-cities.json')
    // Call map on the response observable to get the parsed people object
    .map(res => res.json())
    // Subscribe to the observable to get the parsed people object and attach it to the
    // component
    .subscribe(frenchCities => {
      const markers = frenchCities.map(marker => {
        marker.lat = marker.latitude;
        marker.lon = marker.longitude;
        return marker;
      });

      this.pixiOverlayWrapper.createLayer('cities', markers, (marker, textures) => {
        //use random colors...
        const index = Math.floor(Math.random() * this.colors.length);                                                               
        const hexColor = this.pixiOverlayWrapper.convertColorToHex(this.colors[index]);
        let markerSprite = new PIXI.Sprite(textures['white']);                        
        markerSprite.tint = hexColor;
        markerSprite.originalTint = hexColor;
        markerSprite.buttonMode = true;
        markerSprite.interactive = true;
        markerSprite.alpha = .8;
        markerSprite.hitArea = new PIXI.Circle(0, 0, 15);
        //markerSprite.interactiveChildren = false;
        markerSprite.on('mousedown', () => {
            alert(marker.city || marker.label);
        });
        // markerSprite.on('mouseover', () => {
        //     const hexColor = self.pixiOverlayWrapper.convertColorToHex("#FFD700");
        //     markerSprite.tint = hexColor;
        //     markerSprite.alpha = 1;
        //     self.pixiOverlayWrapper.render();
        // });
        // markerSprite.on('mouseout', () => {
        //     markerSprite.tint = markerSprite.originalTint;
        //     markerSprite.alpha = .8;
        //     self.pixiOverlayWrapper.render();
        // });
        return markerSprite;
      });
      //self.pixiOverlayWrapper.createLayer('cities', markers);
      this.pixiOverlayWrapper.render();
    });
  }
}
