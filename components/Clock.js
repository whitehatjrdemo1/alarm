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
import AsyncStorage from "@react-native-community/async-storage";
import { ListItem, Icon } from "react-native-elements";
import PuzzleMake from "./PuzzleMake";
import Checkbox from "expo-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
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
      selected_index: 0,
      edit: false,
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
        var hour = this.state.current_hour + 1;
        var min = this.state.current_min + 5 - 60;
      } else {
        var hour = this.state.current_hour;
        var min = this.state.current_min + 5;
      }
      time = hour < 10 ? "0" + hour : hour + ":" + min < 10 ? "0" + min : min;
      this.newAlarm(time, true);
    }

    console.log(time);

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
            i.active = false;
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
    this.interval2 = setInterval(() => this.getAlarm(), 5000);
    this.interval3 = setInterval(() => this.checkAlarm(), 10000);
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
        this.updateAlarm();
      }
    }
  }
  newAlarm(data, temp) {
    var time = data;

    console.log(time);
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
    this.storeAlarm();
  }
  storeAlarm = async () => {
    AsyncStorage.getItem("all_alarms").then((item) => {
      item = item == null ? [] : JSON.parse(item);
      var obj = this.state.add_alarm;
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
    await AsyncStorage.removeItem("all_alarms");
    this.getAlarm();
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
    console.log(time);
    var alarms = this.state.alarms;
    alarms.forEach((i) => {
      if (i.time === time && i.active == true) {
        if (i.rep) {
          if (i.days[current_day]) {
            this.setState({
              showPuzzle: true,
              currentAlarm: i,
            });
          }
        } else {
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
            return item.temp && item != undefined ? (
              <View style={{ justifyContent: "flex-end" }}>
                <ListItem key={index} bottomDivider>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        selected_index: index,
                      });
                      this.setState({
                        edit: true,
                      });
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>{item.time} </Text>
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={this.state.edit}
                    mode="time"
                    is24Hour={true}
                    value={this.state.alarms[this.state.selected_index]}
                    display="default"
                    onConfirm={(value) => {
                      var hours = value.getHours();
                      hours = hours < 10 ? "0" + hours : hours;
                      var minutes = value.getMinutes();
                      minutes = minutes < 10 ? "0" + minutes : minutes;
                      var time = hours + ":" + minutes;
                      var temp_alarm = this.state.alarms;
                      var index = this.state.selected_index;
                      temp_alarm[index].time = time;
                      if (time != undefined) {
                        this.setState({
                          alarms: temp_alarm,
                          edit: false,
                        });
                      }
                    }}
                    onCancel={() => {
                      this.setState({
                        edit: false,
                      });
                    }}
                  />

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
                        selected_index: index,
                      });
                    }}
                  >
                    <Image
                      source={
                        item.rep
                          ? require("../assets/repeat1.png")
                          : require("../assets/repeat.png")
                      }
                      style={{ width: 50, height: 50 }}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      backgroundColor: "lightblue",
                      borderRadius: 25,
                    }}
                  >
                    <Modal
                      animationType="none"
                      transparent={true}
                      style={{
                        width: "50%",
                        alignSelf: "right",
                        height: "30%",
                        justifySelf: "flex-end",
                        backgroundColor: "lightblue",
                        flexWrap: "wrap",
                        justifyContent: "space-evenly",
                        borderRadius: 25,
                        color: "white",
                      }}
                      collapsable={true}
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
                        <View
                          style={{
                            backgroundColor: "lightblue",
                            borderRadius: 25,
                            justifySelf: "flex-end",
                            height: "30%",
                            width: "50%",
                            justifyItem: "space-between",
                            alignItems: "space-between",
                          }}
                        >
                          <View
                            style={{
                              height: "15%",
                              justifySelf: "flex-start",
                              backgroundColor: "lightblue",
                              flexWrap: "wrap",
                              borderRadius: 25,

                              justifyContent: "space-evenly",
                            }}
                          >
                            <Text>Daily</Text>
                            <Switch
                              value={
                                this.state.alarms[this.state.selected_index]
                                  .daily
                              }
                              trackColor={{ false: "#767577", true: "#81b0ff" }}
                              thumbColor={
                                this.state.alarms[this.state.selected_index]
                                  .daily
                                  ? "#f5dd4b"
                                  : "#f4f3f4"
                              }
                              onValueChange={() => {
                                var i = this.state.selected_index;
                                var temp_alarm = this.state.alarms;
                                temp_alarm[i].daily = !this.state.alarms[
                                  this.state.selected_index
                                ].daily;

                                if (
                                  this.state.alarms[this.state.selected_index]
                                ) {
                                  temp_alarm[i].days.Monday = true;
                                  temp_alarm[i].days.Tuesday = true;
                                  temp_alarm[i].days.Wednesday = true;
                                  temp_alarm[i].days.Thursday = true;
                                  temp_alarm[i].days.Friday = true;
                                  temp_alarm[i].days.Saturday = true;
                                  temp_alarm[i].days.Sunday = true;
                                  temp_alarm[i].active = true;
                                  temp_alarm[i].rep = true;
                                } else {
                                  temp_alarm[i].days.Monday = false;
                                  temp_alarm[i].days.Tuesday = false;
                                  temp_alarm[i].days.Wednesday = false;
                                  temp_alarm[i].days.Thursday = false;
                                  temp_alarm[i].days.Friday = false;
                                  temp_alarm[i].days.Saturday = false;
                                  temp_alarm[i].days.Sunday = false;
                                  temp_alarm[i].rep = false;
                                }
                                this.setState({
                                  alarms: temp_alarm,
                                });
                                this.updateAlarm();
                              }}
                            />
                          </View>
                          <View
                            style={{
                              alignSelf: "center",
                              height: "70%",
                              justifySelf: "flex-end",
                              backgroundColor: "lightblue",
                              borderRadius: 25,

                              flexWrap: "wrap",
                              justifyContent: "space-between",
                              flexDirection: "row",
                            }}
                          >
                            <View>
                              <Text>Monday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Monday
                                }
                                onValueChange={() => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Monday = !item.days.Monday;
                                  if (!temp_alarm[i].days.Monday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }

                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                            <View>
                              <Text>Tuesday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Tuesday
                                }
                                onValueChange={(value) => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Tuesday = value;
                                  if (!temp_alarm[i].days.Tuesday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }
                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                            <View>
                              <Text>Wednesday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Wednesday
                                }
                                onValueChange={(value) => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Wednesday = value;
                                  if (!temp_alarm[i].days.Wednesday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }

                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                            <View>
                              <Text>Thursday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Thursday
                                }
                                onValueChange={(value) => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Thursday = value;
                                  if (!temp_alarm[i].days.Thursday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }

                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                            <View>
                              <Text>Friday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Friday
                                }
                                onValueChange={(value) => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Friday = value;
                                  if (!temp_alarm[i].days.Friday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }

                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                            <View>
                              <Text>Saturday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Saturday
                                }
                                onValueChange={(value) => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Saturday = value;
                                  if (!temp_alarm[i].days.Saturday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }

                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                            <View>
                              <Text>Sunday</Text>
                              <Checkbox
                                value={
                                  this.state.alarms[this.state.selected_index]
                                    .days.Sunday
                                }
                                onValueChange={(value) => {
                                  var i = this.state.selected_index;

                                  var temp_alarm = this.state.alarms;
                                  temp_alarm[i].days.Sunday = value;
                                  if (!temp_alarm[i].days.Sunday) {
                                    temp_alarm[i].daily = false;
                                  } else {
                                    temp_alarm[i].active = true;
                                    temp_alarm[i].rep = true;
                                  }
                                  this.setState({ alarms: temp_alarm });
                                  this.updateAlarm();
                                }}
                              />
                            </View>
                          </View>
                          <View
                            style={{
                              height: "15%",
                              justifySelf: "flex-end",
                              borderRadius: 25,
                              alignSelf: "flex-end",
                              backgroundColor: "lightblue",
                              flexWrap: "wrap",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                var item = this.state.alarms[
                                  this.state.selected_index
                                ];
                                for (i in item.days) {
                                  if (i === false) {
                                    item.daily = false;
                                  } else {
                                    item.rep = true;

                                    item.active = true;
                                  }
                                }
                                // if (item.daily == false) {
                                //   item.rep = false;
                                // }
                                temp_alarm = this.state.alarms;
                                var index = this.state.selected_index;
                                temp_alarm[index].daily = item.daily;
                                temp_alarm[index].active = item.active;

                                this.setState({
                                  showModal: false,
                                  alarms: temp_alarm,
                                });
                                this.updateAlarm();
                              }}
                              style={{
                                borderRadius: 50,
                                backgroundColor: "blue",
                                width: 60,
                                height: 30,
                                justifySelf: "flex-end",
                              }}
                            >
                              <Text
                                style={{
                                  alignItems: "center",
                                  alignSelf: "center",
                                }}
                              >
                                OK
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>
                  </View>
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
                source={
                  this.state.showTimepicker
                    ? require("../assets/clock.png")
                    : require("../assets/clock1.png")
                }
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          </View>
          <DateTimePickerModal
            isVisible={this.state.showTimepicker}
            mode="time"
            is24Hour={true}
            value={this.state.current_time}
            display="default"
            onConfirm={(value) => {
              var hours = value.getHours();
              hours = hours < 10 ? "0" + hours : hours;
              var minutes = value.getMinutes();
              minutes = minutes < 10 ? "0" + minutes : minutes;
              var time = hours + ":" + minutes;
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
            onCancel={() => {
              this.setState({
                showTimepicker: false,
              });
            }}
          />

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
