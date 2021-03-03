import * as React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Audio } from "expo-av";

export default class PuzzleMake extends React.Component {
  constructor(props) {
    super(props);
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
      break;
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
        alarmSound.setIsLoopingAsync = false;

        await alarmSound.unloadAsync();
      }
    } catch (error) {
      // An error occurred!
      console.log(error);
    }
  };
  updateAnswer = async (text) => {
    this.setState({
      givenAnswer: text,
    });
  };
  dismiss(state) {
    this.props.unmountMe();
    this.props.state(state);
    return null;
  }
  SnoozeButton = () => {
    return Alert.alert(
      "Wrong Answer",
      "Try Again?",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") },
        {
          text: "Snooze",
          onPress: () => this.dismiss("snooze"),
        },
      ],
      { cancelable: false }
    );
  };
  StopButton = () => {
    return Alert.alert(
      "Congratulations!",
      "Alarm Stopped",
      [{ text: "OK", onPress: () => this.dismiss }],
      { cancelable: false }
    );
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
                  puzzleShow: false,
                });
              } else {
                this.dismiss("snooze");
              }
            }}
          >
            <Text>Enter</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      this.dismiss("stop");

      return null;
    }
  }
}
