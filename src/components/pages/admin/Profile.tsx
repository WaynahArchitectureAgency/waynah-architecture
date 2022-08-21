import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import Menu from '../../elements/Menu';
import '../../Admin.css';

type InputChangeType = {
  email: string;
  passworld: string;
  passworldChangeCode: string;
  newPassword: string;
};

const Profile = () => {
  const [user, setUser] = useState<boolean>(false);
  const [inputChange, setInputChange] = useState<InputChangeType>({
    email: '',
    passworld: '',
    passworldChangeCode: '',
    newPassword: ''
  });
  const [showCodeInput, setShowCodeINput] = useState<boolean>(false);
  const [errorMessage, setErrorMessagel] = useState({
    incorrectPasswordOrEmail: false,
    incorrectCode: false,
    incorrectNewPassword: false,
    LengthNotEnough: false
  });
  const [createNewPassword, setCreateNewPassword] = useState<boolean>(true);
  const [newPassword, setNewPassword] = useState('');
  const [checkNewPassword, setCheckNewPassword] = useState('');

  useEffect(() => {
    checkUser();
  }, [user]);

  const checkUser = async () => {
    try {
      await Auth.currentAuthenticatedUser();
      setUser(true);
    } catch (error) {
      console.error(error);
    }
  };

  const showErrorPasswordOrEmail = () => {
    if (errorMessage.incorrectPasswordOrEmail) {
      return <div className="incorrect">Incorrect email or password</div>;
    } else return <></>;
  };

  const showErrorCode = () => {
    if (errorMessage.incorrectCode) {
      return <div className="incorrect">Invalid verification code provided, please try again</div>;
    } else return <></>;
  };

  const errortNewPassword = () => {
    if (errorMessage.incorrectNewPassword) {
      return <div className="incorrect">Incorrect the passsword is not the same</div>;
    } else return <></>;
  };

  const notLengthEnough = () => {
    if (errorMessage.LengthNotEnough) {
      return <div className="incorrect">Password not long enough</div>;
    } else return <></>;
  };

  const passworldVerifyCodeShow = () => {
    return (
      <div>
        <h1>Change password</h1>
        <label>email</label>
        <br />
        <input
          type="email"
          value={inputChange.email}
          onChange={(event: { target: { value: string } }) => {
            setInputChange({ ...inputChange, email: event.target.value });
          }}
          placeholder="email"
        />
        <br />
        <br />
        <label>code recived by email</label>
        <br />
        <input
          type="text"
          value={inputChange.passworldChangeCode}
          onChange={(event: { target: { value: string } }) => {
            setInputChange({ ...inputChange, passworldChangeCode: event.target.value });
          }}
          placeholder="code recived by email"
        />
        <br />
        <br />
        <label>new passworld</label>
        <br />
        <input
          type="password"
          value={inputChange.newPassword}
          onChange={(event: { target: { value: string } }) => {
            setInputChange({ ...inputChange, newPassword: event.target.value });
          }}
          placeholder="new passworld"
        />
        <br />
        <br />
        <button
          type="button"
          className="btn btn-success"
          style={{ marginBottom: '10px' }}
          onClick={async () => {
            try {
              const response = await Auth.forgotPasswordSubmit(
                inputChange.email,
                inputChange.passworldChangeCode,
                inputChange.newPassword
              );
              if (response) {
                setShowCodeINput(false);
                setInputChange({ ...inputChange, passworld: inputChange.newPassword });
              }
            } catch (error: any) {
              console.error(error);
              if (error.code === 'LimitExceededException') {
                setErrorMessagel({ ...errorMessage, incorrectCode: true });
                setTimeout(() => {
                  setErrorMessagel({ ...errorMessage, incorrectCode: false });
                }, 3000);
              }
            }
          }}>
          Change password
        </button>
        {showErrorCode()}
      </div>
    );
  };

  return user === false ? (
    <div className="container text-center">
      <Menu designOn="profile" />
      <div className="divGeneralProfile">
        {showCodeInput ? (
          passworldVerifyCodeShow()
        ) : createNewPassword ? (
          <div>
            <h1>Profile</h1>
            <input
              type="email"
              value={inputChange.email}
              onChange={(event: { target: { value: string } }) => {
                setInputChange({ ...inputChange, email: event.target.value });
              }}
              placeholder="email"
            />
            <br />
            <input
              type="password"
              style={{ marginTop: 10, marginBottom: 10 }}
              value={inputChange.passworld}
              onChange={(event: { target: { value: string } }) => {
                setInputChange({ ...inputChange, passworld: event.target.value });
              }}
              placeholder="passworld"
            />
            <br />
            <button
              type="button"
              className="btn btn-warning"
              style={{ margin: 10 }}
              onClick={async () => {
                try {
                  const result = await Auth.forgotPassword(inputChange.email);
                  if (result) {
                    alert('Check your email and enter the code and the new password');
                    setShowCodeINput(true);
                  }
                } catch (error: any) {
                  console.error(error);
                  if (error.code === 'LimitExceededException') {
                    alert('Attempt limit exceeded, please try after some time.');
                  }
                }
              }}>
              Forgot password
            </button>
            <button
              type="button"
              className="btn btn-success"
              style={{ margin: 10 }}
              onClick={async () => {
                try {
                  await Auth.signIn(inputChange.email, inputChange.passworld).then((user) => {
                    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                      setCreateNewPassword(false);
                    } else {
                      setUser(true);
                    }
                  });
                } catch (error: any) {
                  console.error(error);
                  if (error.code === 'PasswordResetRequiredException') {
                    setShowCodeINput(true);
                  }
                  if (
                    error.code === 'NotAuthorizedException' ||
                    error.code === 'UserNotFoundException'
                  ) {
                    setErrorMessagel({ ...errorMessage, incorrectPasswordOrEmail: true });
                    setTimeout(() => {
                      setErrorMessagel({ ...errorMessage, incorrectPasswordOrEmail: false });
                    }, 3000);
                  }
                }
              }}>
              Connect
            </button>
            {showErrorPasswordOrEmail()}
          </div>
        ) : (
          <div style={{ margin: '10px' }}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="new password"
            />
            <br />
            <br />
            <input
              type="password"
              value={checkNewPassword}
              onChange={(e) => setCheckNewPassword(e.target.value)}
              placeholder="new password"
            />
            <br />
            <br />
            {errortNewPassword()}
            {notLengthEnough()}
            <button
              type="button"
              className="btn btn-success"
              style={{ marginTop: '10px' }}
              onClick={async () => {
                if (newPassword === checkNewPassword) {
                  await Auth.signIn(inputChange.email, inputChange.passworld)
                    .then((user) => {
                      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                        Auth.completeNewPassword(user, newPassword)
                          .then(() => setUser(true))
                          .catch((e: any) => {
                            console.error(e);
                            if (e.code === 'InvalidPasswordException') {
                              setErrorMessagel({ ...errorMessage, LengthNotEnough: true });
                              setTimeout(() => {
                                setErrorMessagel({ ...errorMessage, LengthNotEnough: false });
                              }, 3000);
                            }
                          });
                      }
                    })
                    .catch((e: any) => {
                      console.error(e);
                    });
                } else {
                  setErrorMessagel({ ...errorMessage, incorrectNewPassword: true });
                  setTimeout(() => {
                    setErrorMessagel({ ...errorMessage, incorrectNewPassword: false });
                  }, 3000);
                }
              }}>
              New password
            </button>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="container text-center">
      <Menu designOn="profile" adminMenu={user} />
      <div className="text-center" style={{ marginTop: 200 }}>
        <button
          type="button"
          className="btn btn-dark"
          onClick={async () => {
            await Auth.signOut();
            setUser(false);
          }}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Profile;
