import {Component, ElementRef, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FormControl} from '@angular/forms';
import {NgIf} from "@angular/common";
import {MatIconModule} from '@angular/material/icon';
import {loadTranslations} from "@angular/localize";


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class SearchComponent implements OnInit {
  autoDetect: boolean = false;
  keyword: string = '';
  distance: number = 10;
  category: string = 'Default';
  location: string = '';

  emptyDisplay: boolean = false;
  tableDisplay: boolean = false;
  detailDisplay: boolean = false;
  emptyVenue: boolean = false;
  venueDetail: boolean = false;
  telLess: boolean = false;
  hourLess: boolean = false;
  generalLess: boolean = false;
  childLess: boolean = false;
  telMore: boolean = false;
  hourMore: boolean = false;
  generalMore: boolean = false;
  childMore: boolean = false;
  isLiked: boolean = false;
  searchTable: any;
  eventDetail: any;
  venue:any;
  artists: any = [];
  venueMap: boolean = false;
  venueLat: any;
  venueLng: any;


  control = new FormControl();
  minLength = 2;
  isLoading = false;
  texts: any;


  constructor( private http: HttpClient, private el: ElementRef,) {

  }

  ngOnInit(): void {
    this.control.valueChanges.subscribe(x => {
      if (x.length >= this.minLength) {
        this.isLoading = true;
        console.log(x)
        this.callAutocomplete(x);
      } else {
        this.texts = undefined;
      }
    });

  }



  callAutocomplete(text: string): any {
    this.http.get("https://backend-nodejs-390505.wl.r.appspot.com/suggest?keyword=" + text).subscribe(
      (res) => {
        this.texts = res;
        this.isLoading = false;
      }
    );
  }

  clear() {
    this.keyword = '';
    this.distance = 10;
    this.category = 'Default';
    this.location = '';
    this.autoDetect = false;
    this.emptyDisplay = false;
    this.tableDisplay = false;
    this.detailDisplay = false;
  }

  submit() {
    if (this.keyword == '') {
      this.el.nativeElement.querySelector('#keyword').reportValidity();
      return;
    }
    if (!this.autoDetect && this.location == '') {
      this.el.nativeElement.querySelector('#location').reportValidity();
      return;
    }
    this.tableDisplay = false;
    this.detailDisplay = false;
    this.emptyDisplay = false;

    if (this.autoDetect) {
      this.http.get("https://ipinfo.io?token=b5d2f54b8937ca").subscribe(
        (res: any) => {
          var lat = res["loc"].split(",")[0];
          var lng = res["loc"].split(",")[1];
          this.search(lat, lng);
        }
      )
    } else {
      this.http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + this.location + "&key=AIzaSyBPQYD1haDattmC5HT9njXNSyQIcELGw9Q").subscribe(
        (res: any) => {
          if (res['results'].length == 0) {
            this.showEmpty();
            return;
          }
          var lat = res['results'][0]['geometry']['location']['lat'];
          var lng = res['results'][0]['geometry']['location']['lng'];
          console.log(lat, lng);
          this.search(lat, lng);
        }
      )
    }

  }

  search(lat: any, lng: any) {
    this.http.get("https://backend-nodejs-390505.wl.r.appspot.com/search?lat=" + lat + "&lng=" + lng +
      "&keyword=" + this.keyword + "&category=" + this.category + "&distance=" + this.distance).subscribe(
      (res: any) => {
        // console.log(res);
        this.show(res);
      }
    )
  }

  show(res: any) {
    if (res.length == 0) {
      this.showEmpty();
    } else {
      res = res.sort((a: any, b: any) => {
        if ((a.localDate).localeCompare(b.localDate) == 0) {
          return (a.localTime).localeCompare(b.localTime)
        } else {
          return (a.localDate).localeCompare(b.localDate);
        }
      });
      console.log(res);
      this.showTable(res);
    }
  }

  showEmpty() {
    this.tableDisplay = false;
    this.detailDisplay = false;
    this.emptyDisplay = true;
  }

  showTable(res: any) {
    this.searchTable = res;
    this.emptyDisplay = false;
    this.detailDisplay = false;
    this.tableDisplay = true;
  }

  showDetail(id: any) {
    console.log(id);
    this.http.get("https://backend-nodejs-390505.wl.r.appspot.com/event?id=" + id).subscribe(
      (res: any) => {
        console.log(res);
        this.eventDetail = res;
        this.tableDisplay = false;
        this.detailDisplay = true;
        if(localStorage.getItem(id)){
         this.isLiked = true;
        }else{
          this.isLiked = false;
        }
        this.showVenue(this.eventDetail['venue']);
        this.artists = [];
        for (var i = 0; i < this.eventDetail['artist'].length; ++i) {
          this.showArtist(i);
        }
      }
    )

  }

  returnTable() {
    this.detailDisplay = false;
    this.tableDisplay = true;
  }

  twitter() {
    return "https://twitter.com/intent/tweet?text=Check%20" + encodeURIComponent(this.eventDetail['name']) + "%20on%20Ticketmaster.%0D%0A" + encodeURIComponent(this.eventDetail['url']);
  }

  facebook() {
    return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(this.eventDetail['url']);
  }

  async showArtist(i: any) {
    var res = await this.http.get("https://backend-nodejs-390505.wl.r.appspot.com/artist?name=" + this.eventDetail['artist'][i].replaceAll('&','%26')).toPromise();
    console.log(res);
    // @ts-ignore
    if (Object.keys(res).length !== 0) {
      this.showAlbum(res);
    }
  }

  async showAlbum(artist:any) {
    var responce = await this.http.get("https://backend-nodejs-390505.wl.r.appspot.com/album?id=" + artist['id']).toPromise();
    artist['album'] = responce;
    console.log(this.artists);
    this.artists.push(artist);
  }

  artistsOrder():any{
    var artistsOrdered = [];
    for (var i = 0; i < this.eventDetail['artist'].length; ++i) {
      for (var j = 0; j<this.artists.length;++j){
        if (this.eventDetail['artist'][i].toLowerCase() == this.artists[j]['name'].toLowerCase()){
          artistsOrdered.push(this.artists[j]);
        }
      }
    }
    return artistsOrdered;
  }

  addCommas(num: any) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  showVenue(str: any){
    this.http.get("https://backend-nodejs-390505.wl.r.appspot.com/venue?str="+str).subscribe(
      (res:any)=>{
        this.venue = res;
        if (Object.keys(res).length == 0){
          this.emptyVenue = true;
          this.venueDetail = false;
        }else {
          this.emptyVenue = false;
          this.venueDetail = true;
        }
        console.log(res);
      }
    )
  }

  moreButton(id:any):boolean{
    var text = document.getElementById(id);
    var height = 0;
    if(text){
      height = text.clientHeight;
      console.log(height);
    }
    if (height > 42){
      return true;
    }
    return false;
  }

  showMore(moreId:any,lessId:any,containerId:any) {
    var showMoreBtn = document.getElementById(moreId);
    var showLessBtn = document.getElementById(lessId);
    var textContainer = document.getElementById(containerId);
    if (textContainer) {
      textContainer.style.maxHeight = 'none';
    }
    if (showMoreBtn) {
      showMoreBtn.style.display = 'none';
    }
    if (showLessBtn) {
      showLessBtn.style.display = 'block';
    }
  }

  showLess(moreId:any,lessId:any,containerId:any) {
    var showMoreBtn = document.getElementById(moreId);
    var showLessBtn = document.getElementById(lessId);
    var textContainer = document.getElementById(containerId);
    if(textContainer){
      textContainer.style.maxHeight='42px';
    }
    if(showMoreBtn){
      showMoreBtn.style.display='block';
    }
    if(showLessBtn){
      showLessBtn.style.display='none';
    }
  }

  getWidth(){
    var modal = document.getElementById('modalbody');
    var width = 0;
    if (modal){
      width = modal.clientWidth;
      console.log(width);
    }
    return width-32;
  }

  venueLoc(){
    this.venueMap = false;
    this.http.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + this.venue['address'] +','+this.venue['city']+','+this.venue['state']+ "&key=AIzaSyBPQYD1haDattmC5HT9njXNSyQIcELGw9Q").subscribe(
      (res: any) => {
        if (res['results'].length == 0) {
          return;
        }
        var lat = res['results'][0]['geometry']['location']['lat'];
        var lng = res['results'][0]['geometry']['location']['lng'];
        console.log(lat, lng);
        this.venueMap = true;
        this.venueLat = lat;
        this.venueLng = lng;
      }
    )
  }

  addLike(){
    var likeEvent = {
      'date': this.eventDetail['localDate'],
      'event': this.eventDetail['name'],
      'category': this.eventDetail['genre'],
      'venue': this.eventDetail['venue'],
      'id':this.eventDetail['id']
    }
    console.log([this.eventDetail['id'], JSON.stringify(likeEvent)])
    localStorage.setItem(this.eventDetail['id'], JSON.stringify(likeEvent));
    this.isLiked = true;
    alert("Event Added to Favorites!");
  }

  removeLike(){
    localStorage.removeItem(this.eventDetail['id']);
    this.isLiked = false;
    alert("Removed from Favorites!");
  }
}
