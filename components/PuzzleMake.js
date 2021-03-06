import * as React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
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
    //console.log(answer + " " + this.state.givenAnswer);
  }
  _onPlaybackStatusUpdate = (playbackStatus) => {
    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      console.log("loaded");

      if (playbackStatus.isPlaying) {
      } else {
        // Update your UI for the paused state
      }

      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        if (!this.state.playSound) {
          playbackStatus.setIsLoopingAsync(true);
        }
      }

      // etc
    }
  };

  playSound = async () => {
    const alarmSound = await new Audio.Sound();
    try {
      await alarmSound.loadAsync(
        require("../assets/Loud_Alarm_Clock_Buzzer.mp3")
      );
      await alarmSound.playAsync();
      alarmSound.setIsLoopingAsync(true);
      //alarmSound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);

      if (!this.state.playSound) {
        alarmSound.setIsLoopingAsync(false);
        alarmSound.stopAsync();
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
        <View
          style={{
            height: "30%",
            width: "40%",
            backgroundColor: "lightblue",
            borderRadius: 15,
          }}
        >
          <Text style={{ fontSize: 30 }}>
            {this.state.num1}
            {this.state.operator}
            {this.state.num2}
          </Text>

          <TextInput
            style={{
              width: 100,
              height: 40,
              color: "black",
              backgroundColor: "lightgrey",
              borderColor: "grey",
              borderRadius: 2,
              fontSize: 25,
            }}
            keyboardType="number-pad"
            onChangeText={(text) => {
              this.setState({
                givenAnswer: text,
              });
            }}
            value={this.state.givenAnswer}
            placeholder={this.state.givenAnswer}
          />
          <TouchableOpacity
            style={{
              width: 100,
              height: 30,
              backgroundColor: "blue",
              borderColor: "grey",
              borderRadius: 25,
            }}
            onPress={() => {
              this.state.answer == this.state.givenAnswer
                ? this.setState({
                    playSound: false,
                    puzzleShow: false,
                  })
                : (this.setState({
                    num1: Math.ceil(Math.random() * 55),
                    num2: Math.ceil(Math.random() * 55),
                  }),
                  this.puzzle());
            }}
          >
            <Text style={{ fontSize: 20 }}>Enter</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      this.dismiss("stop");

      return null;
    }
  }
}
