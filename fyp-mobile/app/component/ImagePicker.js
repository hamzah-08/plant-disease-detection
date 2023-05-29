import React, {useState, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  Button,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  PermissionsAndroid,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';

function FilePicker() {
  const [fileResponse, setFileResponse] = useState(null);
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    requestStoragePermission();
  }, []);

  useEffect(() => {
    if (fileResponse) {
      console.log(fileResponse);
      getVideoResponse(fileResponse);
    }
  }, [fileResponse]);

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permission title',
          message: 'Permission message',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the EXTERNAL_STORAGE');
      } else {
        console.log('EXTERNAL_STORAGE permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDocumentSelection = async () => {
    try {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'mixed',
        },
        res => {
          if (res) {
            console.log(res);
            if (res?.assets) {
              setFileResponse(res.assets[0]);
            }
          }
        },
      );
    } catch (error) {
      console.log('This is selection error' + error);
    }
  };

  const getVideoResponse = file => {
    const attachmentData = new FormData();
    attachmentData.append('file', {
      name: file?.type?.substr(6),
      type: file?.type,
      uri: Platform.OS !== 'android' ? 'file://' + file?.uri : file?.uri,
    });

    let formData = new FormData();
    formData.append('select_file', {
      name: file?.type?.substr(6),
      type: file?.type,
      uri: Platform.OS !== 'android' ? 'file://' + file?.uri : file?.uri,
    });

    try {
      fetch(`http://localhost:4000/predict`, {
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          if (data) {
            setResponseData(data);
          }
        });
    } catch (error) {
      console.log('error : ' + error);
      return error;
    }
  };

  return (
    <View>
      {fileResponse && (
        <>
          <View style={{justifyContent: 'center', alignContent: 'center'}}>
            <Image
              source={{uri: fileResponse.uri}}
              resizeMode="cover"
              style={{minHeight: 300, minWidth: 300, marginBottom: 30}}
            />
          </View>
        </>
      )}

      <Button title="Select 📑" onPress={handleDocumentSelection} />
      {responseData && responseData.label && (
        <>
          <View style={{justifyContent: 'center', alignContent: 'center'}}>
            <Text style={{fontSize: 25, marginTop: 20, fontWeight: 'bold', textAlign:'center'}}>
              {responseData.label}{' '}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

export default FilePicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uri: {
    paddingBottom: 8,
    paddingHorizontal: 18,
  },
});
