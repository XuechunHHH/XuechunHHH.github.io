// google api:AIzaSyBPQYD1haDattmC5HT9njXNSyQIcELGw9Q
// ip : b5d2f54b8937ca
// ticket: hkd6lIBkV2PJxAAC4ElXY8XvTAHT2wmL
let lat;
let lng;
let keyword;
let category;
let distance;
function changeState(){
    checkStatus = document.getElementById("checkbox").checked;
    if (checkStatus) {
        document.getElementById("location").type = "hidden";
    } else {
        document.getElementById("location").type = "text";
    }
}

function clearForm(){
    if (document.getElementById("empty")) {
		document.getElementById("empty").remove();
	}
    if (document.getElementById("table")) {
		document.getElementById("table").remove();
	}
    if (document.getElementById("edetail")) {
		document.getElementById("edetail").remove();
	}
    if (document.getElementById("vdetail")) {
		document.getElementById("vdetail").remove();
	}
    if (document.getElementById("vmore")) {
		document.getElementById("vmore").remove();
	}
    document.getElementById("keyword").value = "";
	document.getElementById("distance").value = "";
	document.getElementById("category").value = "Default";
	document.getElementById("location").value = "";
	document.getElementById("checkbox").checked = false;
    document.getElementById("location").type = "text";
}

function submitForm(){
    if (!document.getElementById("keyword").checkValidity()){
        document.getElementById("keyword").setCustomValidity("Please fill out this field.")
        document.getElementById("keyword").reportValidity();
        return;
    }

    if (!document.getElementById("location").checkValidity() && !document.getElementById("checkbox").checked){
        document.getElementById("location").setCustomValidity("Please fill out this field.")
        document.getElementById("location").reportValidity();
        return;
    }

    if (document.getElementById("empty")) {
		document.getElementById("empty").remove();
	}
    if (document.getElementById("table")) {
		document.getElementById("table").remove();
	}
    if (document.getElementById("edetail")) {
		document.getElementById("edetail").remove();
	}
    if (document.getElementById("vdetail")) {
		document.getElementById("vdetail").remove();
	}
    if (document.getElementById("vmore")) {
		document.getElementById("vmore").remove();
	}
    
    keyword = document.getElementById("keyword").value;
	category = document.getElementById("category").value;
    if(category=="Arts & Theatre"){
        category = "Arts";
    }
	distance = parseFloat(document.getElementById("distance").value);
    if(window.isNaN(distance)){
        distance = 10;
    }

    if (document.getElementById("checkbox").checked){
        var req = new XMLHttpRequest();
        req.open("GET","https://ipinfo.io?token=b5d2f54b8937ca",true);
        req.onreadystatechange = function(){
            if (req.readyState == 4){
                if (req.status == 200){
                    var doc = eval('('+req.responseText+')').loc.split(",");
                    lat = doc[0];
                    lng = doc[1];   
                    processData(keyword,category,distance,lat,lng); 
                }
            }
        }
        req.send();
    }else{
        var add = document.getElementById("location").value;
        add = add.replaceAll(" ","%20");
        add = add.replaceAll(",","%20");
        var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+add+"&key=AIzaSyBPQYD1haDattmC5HT9njXNSyQIcELGw9Q";
        var req = new XMLHttpRequest();
        req.open("GET",url,true);
        req.onreadystatechange = function(){
            if (req.readyState == 4){
                if (req.status == 200){
                    var doc = eval('('+req.responseText+')');
                    lat = doc['results'][0]['geometry']['location']['lat'];
                    lng = doc['results'][0]['geometry']['location']['lng'];
                    processData(keyword,category,distance,lat,lng);
                }
            }
        }   
        req.send(); 
    }
}

function processData(keyword,category,distance,lat,lng){
    var url = "/processData?keyword="+keyword+"&category="+category+"&distance="+distance+"&lat="+lat+"&lng="+lng;
    var tomain = new XMLHttpRequest();
    tomain.open("GET",url,true);
    tomain.onreadystatechange = function(){
        if (tomain.readyState == 4){
            if (tomain.status == 200){
                doc = eval('('+tomain.responseText+')');
                if (JSON.stringify(doc) == "{}"){
                    createEmpty()
                }else{
                    createTable()
                }
            }
        }
    }
    tomain.send();
}

function createEmpty(){
    if (document.getElementById("empty")) {
		document.getElementById("empty").remove();
	}
    if (document.getElementById("table")) {
		document.getElementById("table").remove();
	}
    var etable = document.createElement("table");
    etable.id = "empty";
    etable.innerText = "No records found";
    etable.setAttribute("class","table_empty");
    etable.setAttribute("style","color:red; line-height:40px");
    document.getElementById("page").appendChild(etable);
}

function createTable(){
    if (document.getElementById("empty")) {
		document.getElementById("empty").remove();
	}
    if (document.getElementById("table")) {
		document.getElementById("table").remove();
	}
	if (document.getElementById("edetail")) {
		document.getElementById("edetail").remove();
	}
    if (document.getElementById("vdetail")) {
		document.getElementById("vdetail").remove();
	}
    if (document.getElementById("vmore")) {
		document.getElementById("vmore").remove();
	}
    var etablediv = document.createElement("div");
    var etable = document.createElement("table");
    etable.id = "table";
    etable.setAttribute("class","table");
    var htmlText = "<tr><div class=\"shadow\"><th id=\"date\" style=\"width:18%\">Date</th><th id=\"icon\" style=\"width:18%\">Icon</th>";
    htmlText += "<th id=\"event\" onclick=\"sortTable(2)\">Event</th>";
    htmlText += "<th id=\"genre\" style=\"width:13%\" onclick=\"sortTable(3)\">Genre</th>";
    htmlText += "<th id=\"venue\" style=\"width:20%\" onclick=\"sortTable(4)\">Venue</th>";
    htmlText += "</div></tr>"
    console.log(doc[0]);
    for (var i in doc){
        var element = doc[i];
        htmlText += "<tr><td>"+element["localDate"]+"<br/>"+element["localTime"]+"</td>";
        htmlText += "<td><img class=\"table_img\" src=\""+element["Icon"]+"\"></td>";
        htmlText += "<td><a href=\"javascript:void(0)\" id=\""+element["id"]+"\" class=\"eventlink eventlink:active\" onclick=\"eventDetail(this.id)\">"+ element["Event"]+"</a></td>";
        htmlText += "<td>"+element["Genre"]+"</td>";
        htmlText += "<td>"+ element["Venue"]+"</td>";
        htmlText += "</tr>"
    }


    etable.innerHTML = htmlText;
    etablediv.appendChild(etable);
    document.getElementById("page").appendChild(etablediv);
}

function sortTable(n) {
    var cnt = 0;
    var table = document.getElementById("table");
    var sorting = true;
    var dir = true;
    while (sorting) {
      sorting = false;
      var line = table.rows;
      for (var i = 1; i < (line.length - 1); i++) {
        var isswitch = false;
        var first = line[i].getElementsByTagName("td")[n];
        var second = line[i + 1].getElementsByTagName("td")[n];
        if (dir) {
          if (first.innerText.toLowerCase() > second.innerText.toLowerCase()) {
            isswitch = true;
            break;
          }
        } else {
          if (first.innerText.toLowerCase() < second.innerText.toLowerCase()) {
            isswitch = true;
            break;
          }
        }
      }
      if (isswitch) {
        line[i].parentNode.insertBefore(line[i + 1], line[i]);
        sorting = true;
        cnt += 1;
      } else {
        if (cnt == 0 && dir) {
          dir = false;
          sorting = true;
        }
      }
    }
  }

function eventDetail(id){
    var url = "/eventDetail?id="+id;
    var tomain = new XMLHttpRequest();
    tomain.open("GET",url,true);
    tomain.onreadystatechange = function(){
        if (tomain.readyState == 4){
            if (tomain.status == 200){
                edetail = eval('('+tomain.responseText+')');
                console.log(edetail);
                showEdetail();
            }
        }
    }
    tomain.send();
}

function showEdetail(){
    if (document.getElementById("empty")) {
		document.getElementById("empty").remove();
	}
	if (document.getElementById("edetail")) {
		document.getElementById("edetail").remove();
	}
    if (document.getElementById("vdetail")) {
		document.getElementById("vdetail").remove();
	}
    if (document.getElementById("vmore")) {
		document.getElementById("vmore").remove();
	}
    var ediv = document.createElement("div");
    ediv.id = "edetail";
    ediv.setAttribute("class","edetail");
    var titlediv = document.createElement("div");
    titlediv.id = "etitle";
    titlediv.setAttribute("class","etitle")
    titlediv.innerText = edetail["name"];
    var img = document.createElement("img");
    img.id = "eimg";
    img.src = edetail["seatmap"];
    img.setAttribute("class","eimg");
    ediv.appendChild(titlediv);
    ediv.appendChild(img);
    var contain = document.createElement("div");
    contain.id = "econtain";

    var htmlText = "<div class=\"etag\">Date</div><div class=\"eword\">"+edetail["localDate"]+" "+edetail["localTime"]+"</div>";
    htmlText += "<div class=\"etag\">Artist/Team</div>";
    if(edetail["attraction"].length == 0){
        htmlText +="<div class=\"eword\">NA</div>";
    }else{
        htmlText +="<div class=\"ehref\"><span><a href=\""+edetail["attraction"][0]["url"]+"\" target=\"_blank\" style=\"color:rgb(5, 132, 211);\">"+edetail["attraction"][0]["name"]+"</a></span>";
        for (var i=1;i<edetail["attraction"].length;++i){
            if (edetail["attraction"][i]["name"].length!=0){
                htmlText += "<span>|</span>";
                htmlText += "<span><a href=\""+edetail["attraction"][i]["url"]+"\" target=\"_blank\" style=\"color:rgb(5, 132, 211);\">"+edetail["attraction"][i]["name"]+"</a></span>";
            }
        }
        htmlText += "</div>";
    }
    htmlText += "<div class=\"etag\">Venue</div><div class=\"eword\">"+edetail["venue"]+"</div>";
    htmlText += "<div class=\"etag\">Genres</div>";
    if(edetail["genre"].length == 0){
        htmlText +="<div class=\"eword\">NA</div>";
    }else{
        htmlText += "<div class=\"eword\"><span>"+edetail["genre"][0]+"</span>";
        for (var i=1;i<edetail["genre"].length;++i){
            if (edetail["genre"][i].length!=0){
                htmlText += "<span>|</span>";
                htmlText += "<span>"+edetail["genre"][i]+"</span>";
            }
        }
        htmlText += "</div>";
    }
    htmlText += "<div class=\"etag\">Ticket Status</div>";
    if (edetail["status"] == "onsale"){
        htmlText += "<span class=\"estatus\" style=\"background-color: green;\">On Sale</span>";
    } else if (edetail["status"] == "offsale"){
        htmlText += "<span class=\"estatus\" style=\"background-color: red;\">Off sale</span>";
    } else if (edetail["status"] == "cancelled"){
        htmlText += "<span class=\"estatus\" style=\"background-color: black;\">Cancelled</span>";
    } else if (edetail["status"] == "postponed"){
        htmlText += "<span class=\"estatus\" style=\"background-color: orange;\">Postponed</span>";
    }else if (edetail["status"] == "rescheduled"){
        htmlText += "<span class=\"estatus\" style=\"background-color: orange;\">Rescheduled</span>";
    }
    htmlText += "<div class=\"etag\">Buy Ticket At:</div>";
    htmlText +="<div class=\"ehref\"><span><a href=\""+edetail["url"]+"\" target=\"_blank\" style=\"color:rgb(5, 132, 211);\">Ticketmaster</a></span>";
    contain.innerHTML = htmlText;
    ediv.appendChild(contain);
    document.getElementById("page").appendChild(ediv);
    var vmore = document.createElement("div");
    vmore.id = "vmore";
    vmore.innerHTML="<div class=\"vmore\">Show Venue Details</div><div class=\"v\" id=\""+edetail["venue"]+"\" onclick=\"venueDetail(this.id)\"></div>"
    document.getElementById("page").appendChild(vmore);
}

function venueDetail(str){
    var url = "/venueDetail?str="+str;
    var tomain = new XMLHttpRequest();
    tomain.open("GET",url,true);
    tomain.onreadystatechange = function(){
        if (tomain.readyState == 4){
            if (tomain.status == 200){
                vdetail = eval('('+tomain.responseText+')');
                console.log(vdetail);
                showVdetail();
            }
        }
    }
    tomain.send();
}

function showVdetail(){
    if (document.getElementById("vmore")) {
		document.getElementById("vmore").remove();
	}
    if (document.getElementById("vdetail")) {
		document.getElementById("vdetail").remove();
	}
    var vdiv = document.createElement("div");
    vdiv.id = "vdetail";
    vdiv.setAttribute("class","vdetail");
    var vtitlediv = document.createElement("div");
    vtitlediv.setAttribute("class","vtitlediv")
    var vtitle = document.createElement("span");
    vtitle.id = "vtitle";
    vtitle.setAttribute("class","vtitle");
    vtitle.innerText=vdetail["name"];
    vtitlediv.appendChild(vtitle);
    vdiv.appendChild(vtitlediv);

    if (vdetail["img"] != 0){
        var imgdiv = document.createElement("div");
        imgdiv.setAttribute("class","imgdiv")
        var img = document.createElement("img");
        img.setAttribute("class","vimg");
        img.id = "vimg";
        img.src = vdetail["img"][0]["url"];
        imgdiv.appendChild(img);
        vdiv.appendChild(imgdiv);
    }

    var box1 = document.createElement("div");
    box1.setAttribute("class","box1");
    vdiv.appendChild(box1);
    var box2 = document.createElement("div");
    box2.setAttribute("class","box2");
    vdiv.appendChild(box2);
    var htmlText = "<span class=\"address\">Address: </span><span class=\"addword\">"+vdetail["address"]+"</span></br>";
    htmlText +="<span class=\"addline\">"+vdetail["city"]+", "+vdetail["statecode"]+"</span></br>";
    htmlText +="<span class=\"addline\">"+vdetail["postalCode"]+"</span></br>";
    
    var field = vdetail["address"]+vdetail["city"]+vdetail["statecode"]+vdetail["postalCode"];
    field = field.replaceAll(" ","+");
    field = field.replaceAll(".","%2E");
    field = field.replaceAll(",","%2C");
    var gourl = "https://www.google.com/maps/search/?api=1&query="+field;
    htmlText +="<div class=\"gomap\"><a href=\""+gourl+"\" target=\"_blank\" class=\"gohref\">Open in Google Maps</a></div>";
    box1.innerHTML=htmlText;
 
    var box2text = "<div class=\"upcome\"><a href=\""+vdetail["upcoming"]+"\" target=\"_blank\" class=\"gohref\">More events at this venue</a></div>";
    box2.innerHTML=box2text;

    document.getElementById("page").appendChild(vdiv);
}