"use strict";

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MyTheme from '../theme/theme.js';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import { findUser } from '../services/userServices.js'
import $ from 'jquery'

const items = [
  <MenuItem key={1} value={'Dog Park'} primaryText="Dog Park" />,
  <MenuItem key={2} value={'Beach'} primaryText="Beach" />,
  <MenuItem key={3} value={'Trails'} primaryText="Trails" />,
  <MenuItem key={4} value={'Park'} primaryText="Park" />,
  <MenuItem key={5} value={'Something'} primaryText="Something Else" />
];

class MeetupCreation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {category: 'Dog Park', lat: null, lng: null};
    this.handleChange = this.handleChange.bind(this);
    this.updateLocSearchBox = this.updateLocSearchBox.bind(this)
  }

  handleChange(prop, event, time, value) {
    var newValue;
    if (prop === 'date') {
      newValue = time.toDateString();
    } else if (prop === 'time') {
      newValue = time.toTimeString();
    } else if (prop === 'category') {
      newValue = value;
      this.setState({'category': value});
    } else {
      newValue = event.target.value;
    }
    this.props.change(prop, newValue);
  }

  updateLocSearchBox(loc) {
    document.getElementById('pac-input').value = loc
    this.props.change('loc', loc)
  }

  componentDidMount() {
    findUser(this.props.targetUser)
    .then((user) => {
      this.setState({'friendName': user.firstname});
      this.setState({'friendDogName': user.dogname});
    })
    this.loadMap();
  }

  loadMap() {
    var self = this;
    let userLoc = {lat: this.props.lat, lng: this.props.lng}
    let options = {
      center: userLoc,
      zoom: 13,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true
    }

    let map = new google.maps.Map(document.getElementById('map'), options);

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);

    //remove default placeholder for search box
    $('input#pac-input').attr('placeholder', '')
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length === 1) {
        let place = places[0].geometry.location
        self.setState({lat: place.lat(), lng: place.lng()})
        self.props.change('lat', place.lat())
        self.props.change('lng', place.lng())
        console.log(places[0].name)
        self.props.change('loc', places[0].name)
      }
      if (places.length === 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        var marker = new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        });
        markers.push(marker);

        //Listen for clicks on markers
        marker.addListener('click', () => {
        self.setState({lat: marker.position.lat(), lng: marker.position.lng()})
        self.props.change('lat', marker.position.lat())
        self.props.change('lng', marker.position.lng())
        self.updateLocSearchBox(marker.title)
        })

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }

  render() {
    const styles = {
      height: '250px',
      width: '400px'
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(MyTheme)}>
        <div>
            <TextField
              hintText={'Park Meetup with ' + this.state.friendDogName + ' and ' + this.state.friendName}
              floatingLabelText="Event Name"
              name="eventname"
              errorText={this.props.errorText.eventname}
              onChange={this.handleChange.bind(this, 'eventname')}
              style={{width: 400}} />
            <br />
            <SelectField
              floatingLabelText="Category"
              value={this.state.category}
              name="category"
              errorText={this.state.category===null && 'Required'}
              onChange={this.handleChange.bind(this, 'category')}
              style={{width: 400, 'text-align': 'left'}}
            >
              {items}
            </SelectField>
            <br />
            <TextField
              id="pac-input"
              hintText="Search a location and select from map"
              floatingLabelText="Where"
              name="where"
              errorText={this.props.errorText.where}
              onChange={this.handleChange.bind(this, 'loc')}
              style={{width: 400}}/>

            <div id="map" style={styles}></div>
            <br />
            <DatePicker
              hintText="Pick a Day"
              name="date"
              errorText={this.props.errorText.date}
              onChange={this.handleChange.bind(this, 'date')}
              textFieldStyle={{width: 400}}
             />
            <br />
            <TimePicker
              hintText="Pick a Time"
              name="time"
              errorText={this.props.errorText.time}
              onChange={this.handleChange.bind(this, 'time')}
              textFieldStyle={{width: 400}}
            />
        </div>
      </MuiThemeProvider>
    )
  }
}

module.exports = MeetupCreation;