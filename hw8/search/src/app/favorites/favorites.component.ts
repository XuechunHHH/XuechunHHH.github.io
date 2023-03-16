import {Component} from '@angular/core';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent {

  displayEmpty(): boolean {
    localStorage.removeItem('loglevel');
    if (localStorage.length == 0) {
      return true;
    } else {
      return false;
    }
  }

  likedList(): any {
    localStorage.removeItem('loglevel');
    var list: any = [];
    for (var i = 0; i < localStorage.length; ++i) {
      var id: any = localStorage.key(i);
      var str: any = localStorage.getItem(id);
      var dic: any = JSON.parse(str);
      dic['num'] = i + 1;
      for (var j = 0; j < dic['category'].length; ++j) {
        if (dic['category'][j] == null) {
          dic['category'].splice(j, 1);
          j--;
          console.log(dic['category']);
        }
      }
      list.push(dic);
    }
    console.log(list);
    return list;
  }

  removeLike(id:any){
    localStorage.removeItem(id);
    alert("Removed from Favorites!");
  }

}
