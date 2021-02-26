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
  Modal,
} from "react-native";
import TimePicker from "react-time-picker";
import AsyncStorage from "@react-native-community/async-storage";
import { ListItem } from "react-native-elements";
import PuzzleMake from "./PuzzleMake";
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
      showPuzzle: false,
    };
    this.interval1 = 0;
    this.interval2 = 0;
    this.interval3 = 0;
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
    this.interval1 = setInterval(() => this.getTime(), 1000);
    this.interval2 = setInterval(() => this.getAlarm(), 1000);
    this.interval3 = setInterval(() => this.checkAlarm(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval1);
    clearInterval(this.interval2);
    clearInterval(this.interval3);
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
  checkAlarm() {
    var current_day = this.state.current_day;
    var current_hour = this.state.current_hour;
    var current_min = this.state.current_min;
    var time = current_hour + ":" + current_min;
    var alarms = this.state.alarms;
    alarms.forEach((i) => {
      //  if (i.day === current_day) {
      if (i.time === time) {
        this.setState({
          showPuzzle: true,
        });
      }
      //  }
    });
  }
  getAlarm = async () => {
    var alarm = await AsyncStorage.getItem("all_alarms").then((item) => {
      item = item == null ? [] : JSON.parse(item);
      var arr = [];
      arr.push(item);
      item.forEach(() => {
        this.setState({
          alarms: [...item],
        });
      });
    });
  };

  keyExtractor = (item, index) => index.toString();
  renderItem = ({ item }) => (
    <ListItem
      title={"Time: " + item.time + ", Day: " + item.day}
      subtitle={"Active: " + item.active}
      backgroundColor="grey"
      underlayColor="black"
      bottomDivider
    />
  );
  render() {
    if (this.state.showPuzzle === true) {
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
          <ScrollView>
            {this.state.alarms.map((i) => (
              <View>
                <ListItem>{i.time}</ListItem>
              </View>
            ))}
          </ScrollView>
          <PuzzleMake />
        </View>
      );
    } else {
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
          <TimePicker
            onChange={(time) => {
              var new_key = (Math.random() * 16).toString(16);
              var new_alarm = { time: time, day: "", active: true };
              this.setState({
                add_alarm: new_alarm,
              });
            }}
          />
          <ScrollView>
            {this.state.alarms.map((i) => (
              <View>
                <ListItem>{i.time}</ListItem>
              </View>
            ))}
          </ScrollView>
          {/* <View>
            {this.state.alarms.map((item, i) => (
            <ListItem 
            title={item.value}
            key={i} bottomDivider>
              
              <ListItem.Chevron />
            </ListItem>
          ))}
          </View> */}
          {/* <FlatList
            data={this.state.alarms}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
          /> */}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  text: {
    fontSize: 40,
    textAlign: "center",
  },
});
