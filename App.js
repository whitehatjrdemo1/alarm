import { StatusBar } from "expo-status-bar";
import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import Clock from "./components/Clock";

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Clock />
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
