import { StatusBar } from "expo-status-bar";
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import TimePicker from "react-time-picker";
import AsyncStorage from "@react-native-community/async-storage";
import { ListItem } from "react-native-elements";

export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      current_hour: "",
      current_min: "",
      current_sec: "",
      current_date: "",
      current_day: "",
      current_timezone: "",
      current_month: "",
      error: "",
      loading: "",
      refreshing: "",
      alarms: [],
      add_alarm: "",
    };
    this.interval = 0;
  }

  getTime() {
    var date = new Date();
    var current_hour = date.getHours();
    var current_min = date.getMinutes();
    var current_sec = date.getSeconds();
    var current_date = date.getDate();
    var current_day = date.getDay();
    var current_month = date.getMonth();
    var week = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var current_day_text = week[current_day];
    var month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "Octorber",
      "November",
      "December",
    ];
    var current_month_text = month[current_month];
    this.setState({
      current_hour: current_hour,
      current_min: current_min,
      current_sec: current_sec,
      current_date: current_date,
      current_day: current_day_text,
      current_month: current_month_text,
    });
  }

  componentDidMount() {
    this.interval = setInterval(() => this.getTime(), 1000);
    this.getAlarm();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  newAlarm = () => {};
  storeAlarm = async (obj) => {
    AsyncStorage.getItem("all_alarms").then((item) => {
      item = item == null ? [] : JSON.parse(item);

      item.push(obj);

      return AsyncStorage.setItem("all_alarms", JSON.stringify(item));
    });
    this.getAlarm();
  };
  clearAlarm = async () => {
    AsyncStorage.removeItem("all_alarms");

    console.log(this.state.alarms);

    //this.setState({ alarms: [...this.state.alarms, txt] });
  };

  getAlarm = async () => {
    var alarm = await AsyncStorage.getItem("all_alarms").then((inKey) => {
      inKey = inKey == null ? [] : inKey;
      console.log(inKey);
      var element = [inKey];
      this.setState({
        alarms: [...this.state.alarms, ...element],
      });
   
    });
  };

  keyExtractor = (item, index) => index.toString();
  renderItem = ({ item }) => (
    <ListItem
      title={"Key: " + item.id}
      subtitle={"Value: " + item.value}
      backgroundColor="grey"
      underlayColor="black"
      bottomDivider
    />
  );
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {this.state.current_hour +
            ":" +
            this.state.current_min +
            ":" +
            this.state.current_sec}
        </Text>
        <Text style={styles.text}>{this.state.current_timeZone}</Text>
        <Text style={styles.text}>
          {this.state.current_day +
            "," +
            this.state.current_date +
            " " +
            this.state.current_month}
        </Text>
        <Text>{this.state.alarms}</Text>
        <TimePicker
          onChange={(time) => {
            var new_key = (Math.random() * 16).toString(16);
            var new_alarm = { id: new_key, value: time };
            this.setState({
              add_alarm: new_alarm,
            });
          }}
        />
        {/* {this.state.alarms.map((i) => (
          <Text>{this.state.alarms[i]}</Text>
        ))} */}
        {/* <View>
        
          {this.state.alarms.map((item, i) => (
            <ListItem 
            title={item.value}
            key={i} bottomDivider>
              
              <ListItem.Chevron />
            </ListItem>
          ))}
        </View> */}
        <FlatList
          data={this.state.alarms}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
        {<Text>{this.state.alarms}</Text>}
        <TextInput
          onChangeText={(txt) => {
            this.setState({ add_alarm: txt });
          }}
          value={this.state.add_alarm}
        />
        <TouchableOpacity
          onPress={() => {
            this.storeAlarm(this.state.add_alarm);
          }}
        >
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.clearAlarm();
          }}
        >
          <Text>Clear</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    fontSize: 40,
    textAlign: "center",
  },
});
