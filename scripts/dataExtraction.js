var dogData;
var flightData;

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([d3.csv('data/Dogs-Database.csv'),
               d3.csv('data/Flights-Database.csv')])
          .then(function(values){
    
    dogData = values[0];
    flightData = values[1];
    var data = processData(dogData,flightData);
    console.log(data);
  })
});

//get date of flight, gender, fate and latin name of dogs
function processData(dogData,flightData){
    var jsonObject = { 
      name : "SpaceDogs",
      img : "images/spacedog.png",
      children : []
    }
    var cntr = 0;
    var rockets = Array.from(new Set(flightData.map(x => x["Rocket"])));

    var imageData = [];
    for(var k in rockets){
      var cnt = 0;
      var rocketObj = {
        name : rockets[k],
        img : "images/rocket.png",
        children : []
      };
      var processedData = [], i = 0;
      for(var key in flightData){
        var x = flightData[key];
        if(x["Rocket"] == rockets[k]){
          var fate = "dead";
          if((x["Result"]+"").includes("recovered"))
            fate = "alive";
          processedData[i++] = [x["Date"],x["Dogs"],fate]; //date,dogname(s),fate
        }
      }

      for(var key in processedData){
        var dogs = processedData[key][1];
        if((dogs+"").includes(",")){ //if more than one dog
          for(var k in dogData){
            var objects = {};
            if(dogData[k]["Name_Latin"] == dogs.split(',')[0]){
              objects["name"] = dogData[k]["Name_Latin"];
              objects["img"] = "images/"+dogData[k]["Gender"]+"-"+processedData[key][2]+".png";
              objects["size"] = 4000
              objects["year"] = processedData[key][0];
              rocketObj["children"][cnt++] = objects;
            }
            else if(dogData[k]["Name_Latin"] == dogs.split(',')[1]){
              objects["name"] = dogData[k]["Name_Latin"];
              objects["img"] = "images/"+dogData[k]["Gender"]+"-"+processedData[key][2]+".png";
              objects["size"] = 4000
              objects["year"] = processedData[key][0];
              rocketObj["children"][cnt++] = objects;
            }
          }
        }
        else{ //if only one dog
          for(var k in dogData){
            var objects = {};
            if(dogData[k]["Name_Latin"] == dogs){
              objects["name"] = dogData[k]["Name_Latin"];
              objects["img"] = "images/"+dogData[k]["Gender"]+"-"+processedData[key][2]+".png";
              objects["size"] = 4000
              objects["year"] = processedData[key][0];
              rocketObj["children"][cnt++] = objects;
            }
          }
        }
      }
      jsonObject["children"][cntr++] = rocketObj;
    }
    return jsonObject;
}