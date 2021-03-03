import { StatusBar } from "expo-status-bar";
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  FlatList,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {Picker} from '@react-native-picker/picker';
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-community/async-storage";
import { ListItem, Icon } from "react-native-elements";
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
      currentAlarm: "",
      showPuzzle: false,
      showModal: false,
      showTimepicker: false,
      current_time: new Date().getTime(),
    };
    this.handleChildUnmount = this.handleChildUnmount.bind(this);
    //  this.handleTimePicker = this.handleTimePicker.bind(this);

    this.interval1 = 0;
    this.interval2 = 0;
    this.interval3 = 0;
  }
  handleChildUnmount = (state) => {
    this.setState({ showPuzzle: false });
    if (state === "snooze") {
      this.createSnooze();
    }
    this.deactivateAlarm();
  };
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
  componentWillUnmount() {
    if (this.state.showPuzzle) {
      this.createSnooze("snooze");
    }
    clearInterval(this.interval1);
    clearInterval(this.interval2);
    clearInterval(this.interval3);
  }
  createSnooze = (state) => {
    if (state === "snooze") {
      if (this.state.current_min + 5 >= 60) {
        var time =
          this.state.current_hour + 1 + ":" + this.state.current_min + 5 - 60;
      } else {
        var time = this.state.current_hour + ":" + this.state.current_min + 5;
      }

      this.newAlarm(time, true);
    }
    this.deactivateAlarm();
  };
  deactivateAlarm() {
    var temp_alarm = this.state.alarms;
    var item = this.state.currentAlarm;
    if (item.temp) {
      this.deleteTemp();
    } else {
      if (!item.rep) {
        temp_alarm.forEach((i) => {
          if (item.time == i.time && item.key == i.key) {
            item.active = false;
          }
        });

        this.setState({
          alarms: temp_alarm,
        });
        this.updateAlarm();
      }
    }
  }
  componentDidMount() {
    this.interval1 = setInterval(() => this.getTime(), 1000);
    this.interval2 = setInterval(() => this.getAlarm(), 1000);
    this.interval3 = setInterval(() => this.checkAlarm(), 1000);
  }

  deleteTemp() {
    var temp_alarm = this.state.alarms;
    var snooze_alarm = this.state.currentAlarm;
    for (var i in temp_alarm) {
      if (
        snooze_alarm.key == i.key &&
        snooze_alarm.time == i.time &&
        snooze_alarm.rep != true
      ) {
        temp_alarm.splice(i, 1);
        this.setState({
          alarms: temp_alarm,
        });
        console.log(this.state.alarms);
        this.updateAlarm();
      }
    }
  }
  newAlarm(data, temp) {
    var time = data.splice(11, 5);
    var new_key = (Math.random() * 16).toString(16);
    var new_alarm = {
      key: new_key,
      time: time,
      day: "",
      active: true,
      temp: temp,
      rep: false,
      daily: false,
      days: {
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturay: false,
      },
    };
    this.setState({
      add_alarm: new_alarm,
    });
    this.storeAlarm(this.state.add_alarm);
  }
  storeAlarm = async (obj) => {
    console.log(obj);
    AsyncStorage.getItem("all_alarms").then((item) => {
      item = item == null ? [] : JSON.parse(item);

      item.push(obj);

      return AsyncStorage.setItem("all_alarms", JSON.stringify(item));
    });
    this.getAlarm();
  };
  updateAlarm = async () => {
    var item = this.state.alarms;
    return AsyncStorage.setItem("all_alarms", JSON.stringify(item));
  };
  clearAlarm = async () => {
    AsyncStorage.removeItem("all_alarms");
    this.getAlarm();
    console.log(this.state.alarms);
  };
  checkAlarm() {
    var current_day = this.state.current_day;
    var current_hour =
      this.state.current_hour < 10
        ? "0" + this.state.current_hour
        : this.state.current_hour;
    var current_min =
      this.state.current_min < 10
        ? "0" + this.state.current_min
        : this.state.current_min;
    var time = current_hour + ":" + current_min;
    var alarms = this.state.alarms;
    alarms.forEach((i) => {
      console.log(i);
      if (i.days[current_day]) {
        if (i.time === time && i.active == true) {
          this.setState({
            showPuzzle: true,
            currentAlarm: i,
          });
        }
      }
    });
  }
  toggleSwitch = () => {
    var index = 0;
    var temp_alarm = this.state.alarms;
    temp_alarm[index].active = !temp_alarm[index].active;
    this.setState({
      alarms: temp_alarm,
    });
  };
  getAlarm = async () => {
    var alarm = await AsyncStorage.getItem("all_alarms").then((item) => {
      item = item == null ? [] : JSON.parse(item);

      item.forEach(() => {
        this.setState({
          alarms: [...item],
        });
      });
    });
  };

  Alarms = () => {
    return (
      <View style={styles.container}>
        <ScrollView>
          {this.state.alarms.map((item, index) => {
            return item.temp != true && item != undefined ? (
              <View>
                <ListItem key={item.key} bottomDivider>
                  <Text>{item.time} </Text>

                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={item.active ? "#f5dd4b" : "#f4f3f4"}
                    onValueChange={() => {
                      var i = index;
                      var temp_alarm = this.state.alarms;
                      temp_alarm[i].active = !item.active;
                      this.setState({
                        alarms: temp_alarm,
                      });
                      this.updateAlarm();
                    }}
                    value={item.active}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      var i = index;
                      var temp_alarm = this.state.alarms;
                      temp_alarm.splice(i, 1);
                      this.setState({
                        alarms: temp_alarm,
                      });
                      console.log(this.state.alarms);
                      this.updateAlarm();
                    }}
                  >
                    <Image
                      source={require("../assets/delete.png")}
                      style={{ width: 50, height: 50 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        showModal: true,
                      });
                    }}
                  >
                    <Image
                      source={require("../assets/repeat.png")}
                      style={{ width: 50, height: 50 }}
                    />
                  </TouchableOpacity>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    style={{
                      width: "100%",
                      alignSelf: "center",
                      height: "100%",
                      justifyContent: "flex-start",
                      backgroundColor: "green",
                    }}
                    visible={this.state.showModal}
                    onRequestClose={() => {
                      alert("Modal has been closed.");
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        this.setState({ showModal: false });
                      }}
                    >
                      <View style={{ backgroundColor: "red", flex: 1 }}>
                        <Text>Daily</Text>
                        <Switch
                          value={item.daily}
                          trackColor={{ false: "#767577", true: "#81b0ff" }}
                          thumbColor={item.daily ? "#f5dd4b" : "#f4f3f4"}
                          onValueChange={() => {
                            var i = index;
                            var temp_alarm = this.state.alarms;
                            temp_alarm[i].daily = !item.daily;

                            if (item.daily) {
                              temp_alarm[i].days.Monday = true;
                              temp_alarm[i].days.Tuesday = true;
                              temp_alarm[i].days.Wednesday = true;
                              temp_alarm[i].days.Thursday = true;
                              temp_alarm[i].days.Friday = true;
                              temp_alarm[i].days.Saturday = true;
                              temp_alarm[i].days.Sunday = true;
                            } else {
                              temp_alarm[i].days.Monday = false;
                              temp_alarm[i].days.Tuesday = false;
                              temp_alarm[i].days.Wednesday = false;
                              temp_alarm[i].days.Thursday = false;
                              temp_alarm[i].days.Friday = false;
                              temp_alarm[i].days.Saturday = false;
                              temp_alarm[i].days.Sunday = false;
                            }
                            this.setState({
                              alarms: temp_alarm,
                            });
                            this.updateAlarm();
                          }}
                        />
                        <View style={{ flexDirection: "row" }}>
                          <Text>Monday</Text>
                          <Checkbox
                            value={item.days.Monday}
                            onValueChange={() => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Monday = !item.days.Monday;
                              !temp_alarm[i].days.Monday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Monday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />
                          <Text>Tuesday</Text>
                          <Checkbox
                            value={item.days.Tuesday}
                            onValueChange={(value) => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Tuesday = value;
                              !temp_alarm[i].days.Tuesday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Tuesday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />

                          <Text>Wednesday</Text>
                          <Checkbox
                            value={item.days.Wednesday}
                            onPress={() => {
                              item.days.Wednesday = !item.days.Wednesday;
                            }}
                            onValueChange={(value) => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Wednesday = value;
                              !temp_alarm[i].days.Wednesday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Wednesday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />
                          <Text>Thursday</Text>
                          <Checkbox
                            value={item.days.Thursday}
                            onPress={() => {
                              item.days.Wednesday = !item.days.Thursday;
                            }}
                            onValueChange={(value) => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Thursday = value;
                              !temp_alarm[i].days.Thursday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Thursday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />
                          <Text>Friday</Text>
                          <Checkbox
                            value={item.days.Friday}
                            onPress={() => {
                              item.days.Friday = !item.days.Friday;
                            }}
                            onValueChange={(value) => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Friday = value;
                              !temp_alarm[i].days.Friday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Friday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />
                          <Text>Saturday</Text>
                          <Checkbox
                            value={item.days.Saturday}
                            onPress={() => {
                              item.days.Saturday = !item.days.Saturday;
                            }}
                            onValueChange={(value) => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Saturday = value;
                              !temp_alarm[i].days.Saturday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Saturday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />
                          <Text>Sunday</Text>
                          <Checkbox
                            value={item.days.Sunday}
                            onPress={() => {
                              item.days.Sunday = !item.days.Sunday;
                            }}
                            onValueChange={(value) => {
                              var i = index;
                              var temp_alarm = this.state.alarms;
                              temp_alarm[i].days.Sunday = value;
                              !temp_alarm[i].days.Sunday
                                ? (temp_alarm[i].daily = false)
                                : null;

                              console.log(temp_alarm[i].days.Sunday);
                              this.setState({ alarms: temp_alarm });
                              this.updateAlarm();
                            }}
                          />
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>
                </ListItem>
              </View>
            ) : null;
          })}
        </ScrollView>
      </View>
    );
  };

  TimeDisplay = () => {
    return (
      <View>
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
      </View>
    );
  };
  render() {
    if (this.state.showPuzzle === true) {
      return (
        <View style={styles.container}>
          {<this.TimeDisplay />}
          {<this.Alarms />}
          <PuzzleMake
            state={this.createSnooze}
            unmountMe={this.handleChildUnmount}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          {<this.TimeDisplay />}
          <View>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  showTimepicker: !this.state.showTimepicker,
                });
              }}
            >
              <Image
                source={require("../assets/clock.png")}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          </View>
          {this.state.showTimepicker ? (
            <DateTimePicker
              mode="time"
              is24Hour={true}
              value={this.state.current_time}
              display="default"
              onChange={(event, time) => {
                console.log(time);

                if (time != undefined) {
                  this.setState({
                    current_time: time,
                    showTimepicker: false,
                  });
                  console.log(time);
                  this.newAlarm(time, false);
                } 
              }}
            />
          ) : null}

          {<this.Alarms />}

          <TouchableOpacity
            style={{
              borderRadius: 50,
              backgroundColor: "blue",
              width: 100,
              height: 50,
              justifyItem: "center",
            }}
            onPress={() => {
              this.clearAlarm();
            }}
          >
            <Text style={styles.text}>Clear</Text>
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
    fontSize: 20,
    textAlign: "center",
    color: "white",
  },
});
