import React, { useState, useEffect } from 'react';
import { Keyboard, ActivityIndicator, Alert } from 'react-native';
import PropTypes from 'prop-types';

import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  ProfileRemoveButton,
  ContainerButtons,
} from './styles';

Icon.loadFont();

export default function Main({ navigation }) {
  const [newUser, setNewUser] = useState('');
  const [users, setUsers] = useState('');
  const [loading, setLoading] = useState(false);

  // when start
  useEffect(() => {
    async function getLocalusers() {
      const localUsers = await AsyncStorage.getItem('users');

      if (localUsers) {
        setUsers(JSON.parse(localUsers));
      }
    }

    getLocalusers();
  }, []);

  // when update users
  useEffect(() => {
    if (users.length) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    } else {
      AsyncStorage.removeItem('users');
    }
  }, [users]);

  async function handleAddUser() {
    setLoading(true);

    try {
      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      setUsers([...users, data]);
    } catch (error) {
      Alert.alert('Erro ao pesquisar', 'O usuário não existe no Github.');
      console.tron.log(error);
    }

    setNewUser('');
    setLoading(false);

    Keyboard.dismiss();
  }

  async function handleRemoveUser(user) {
    const index = users.indexOf(user);
    const newUsers = users;

    newUsers.splice(index, 1);

    setUsers([...newUsers]);
  }

  function handleNavigate(user) {
    navigation.navigate('User', { user });
  }

  return (
    <Container>
      <Form>
        <Input
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Adiconar usuário"
          value={newUser}
          onChangeText={(text) => setNewUser(text)}
          returnKeyType="send"
          onSubmitEditing={handleAddUser}
        />
        <SubmitButton loading={loading} onPress={handleAddUser}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="add" size={20} color="#fff" />
          )}
        </SubmitButton>
      </Form>

      <List
        data={users}
        keyExtractor={(user) => user.login}
        renderItem={({ item }) => (
          <User>
            <Avatar source={{ uri: item.avatar }} />
            <Name>{item.name}</Name>
            <Bio>{item.bio}</Bio>

            <ContainerButtons>
              <ProfileButton onPress={() => handleNavigate(item)}>
                <ProfileButtonText>Ver perfil</ProfileButtonText>
              </ProfileButton>
              <ProfileRemoveButton onPress={() => handleRemoveUser(item)}>
                <ProfileButtonText>Remover perfil</ProfileButtonText>
              </ProfileRemoveButton>
            </ContainerButtons>
          </User>
        )}
      />
    </Container>
  );
}

Main.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
};
