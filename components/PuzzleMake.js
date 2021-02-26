import * as React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Audio } from "expo-av";

export default class PuzzleMake extends React.Component {
  constructor() {
    super();
    this.state = {
      num1: Math.ceil(Math.random() * 55),
      num2: Math.ceil(Math.random() * 55),
      operations: ["+", "-", "/", "x"],
      operator: "",
      answer: "",
      givenAnswer: "",
      playSound: true,
      puzzleShow: true,
    };
  }
  componentDidMount() {
    this.puzzle();
  }
  puzzle() {
    var num1 = this.state.num1;
    var num2 = this.state.num2;
    var pos = Math.floor(Math.random() * 4);
    //console.log(pos);
    var operator = this.state.operations[pos];
    this.setState({
      operator: operator,
    });
    var answer = 0;
    switch (pos) {
      case 0:
        answer = num1 + num2;
        break;
      case 1:
        answer = num1 - num2;
        break;
      case 2:
        answer = num1 / num2;
        break;
      case 3:
        answer = num1 * num2;
      default:
        break;
    }
    this.setState({
      answer: answer,
    });
    console.log(answer + " " + this.state.givenAnswer);
  }
  playSound = async () => {
    const alarmSound = new Audio.Sound();
    try {
      await alarmSound.loadAsync(
        "http://soundbible.com/mp3/Buzzer-SoundBible.com-188422102.mp3"
      );
      if (this.state.playSound) {
        alarmSound.setIsLoopingAsync = true;
        await alarmSound.playAsync();
      } else {
        await alarmSound.unloadAsync();
      }
      // Your sound is playing!

      // Don't forget to unload the sound from memory
      // when you are done using the Sound object
    } catch (error) {
      // An error occurred!
      console.log(error);
    }
    // var alarmSound = await Audio.Sound.createAsync(
    //   {
    //     uri: "http://soundbible.com/mp3/Buzzer-SoundBible.com-188422102.mp3",
    //   },
    //   { shouldPlay: true }
    // );
    // if (this.state.playSound) {
    //   alarmSound.setIsLoopingAsync(true);
    // }
  };
  updateAnswer = async (text) => {
    this.setState({
      givenAnswer: text,
    });
  };
  render() {
    if (this.state.puzzleShow) {
      if (this.state.playSound) {
        this.playSound();
      }
      return (
        <View>
          <Text>
            {this.state.num1}
            {this.state.operator}
            {this.state.num2}
          </Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(text) => {
              this.updateAnswer(text);
            }}
            value={this.state.givenAnswer}
            placeholder={this.state.givenAnswer}
          />
          <TouchableOpacity
            onPress={() => {
              console.log(this.state.givenAnswer);

              if (this.state.answer == this.state.givenAnswer) {
                this.setState({
                  playSound: false,
                  puzzleShow:false,
                });
              }
            }}
          >
            <Text>Enter</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          <Text>Congratulations! Alarm Stopped</Text>
        </View>
      );
    }
  }
}
