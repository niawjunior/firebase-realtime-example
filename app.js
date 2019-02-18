document.querySelector('#formLogin').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
    alert('ล็อกอินสำเร็จ');
  }).catch(e => {
    if (e.code === 'auth/wrong-password') {
      alert('รหัสผ่านไม่ถูกต้อง');
    } else if (e.code === 'auth/user-not-found') {
      alert('ยังไม่ได้เป็นสมาชิก');
    } else {
      alert('มีบางอย่างผิดพลาด');
    }
  })
})

document.querySelector('#formRegister').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  firebase.auth().createUserWithEmailAndPassword(email, password).then((user) => {
    firebase.database().ref("user").child(user.user.uid).set({
      name: ''
    }).then(() => {
      alert('สมัครสมาชิกเรียบร้อยแล้ว');
    })
  }).catch(e => {
    if(e.code === 'auth/email-already-in-use') {
      alert('อีเมลนี้เป็นสมาชิกแล้ว');
    }
  });
});

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("current-user-id").innerHTML = user.uid;
    document.getElementById("current-user-email").innerHTML = user.email;
    document.getElementById('logout-button').disabled = false;
    document.getElementById('delete-button').disabled = false;
    document.getElementById('post-message-button').disabled = false;
    document.getElementById('update-name-button').disabled = false;
    document.getElementById('check-logout-text').innerHTML = '';
  
  } else {
    document.getElementById("current-user-id").innerHTML = 'ยังไม่ได้ล็อกอิน';
    document.getElementById("current-user-email").innerHTML = 'ยังไม่ได้ล็อกอิน';
    document.getElementById('logout-button').disabled = true;
    document.getElementById('delete-button').disabled = true;
    document.getElementById('post-message-button').disabled = true;
    document.getElementById('update-name-button').disabled = true;

    document.getElementById('check-logout-text').innerHTML = '(ยังไม่ได้ล็อกอิน)';
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    alert('ออกจากระบบเรียบร้อยแล้ว');
  });
}

document.querySelector('#formResetPassword').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value;

  firebase.auth().sendPasswordResetEmail(email).then(() => {
    alert('ส่งลิงค์ยืนยันไปทางอีเมลเรียบร้อยแล้ว');
  }).catch(e => {
    if (e.code === 'auth/user-not-found') {
      alert('ไม่มีอีเมลนี้ในระบบ');
    }
  });
});

document.querySelector('#formDelete').addEventListener('submit', e => {
  e.preventDefault();
  const deleteUser = prompt('กรุณากรอกรหัสผ่านอีกครั้ง');
  if (deleteUser) {
    const credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, deleteUser);
    firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(function () {
      firebase.auth().currentUser.delete().then(() => {}).then(() => {
        alert('ลบบัญชีของคุณแล้ว');
      }).catch(e => {
        console.log(e.code);
      });
    }).catch( e =>  {
     if(e.code === 'auth/wrong-password') {
       alert('รหัสผ่านไม่ถูกต้อง')
     }
    });
  }
});

document.querySelector('#formPostMessage').addEventListener('submit', e => {
  e.preventDefault();
  const message = document.getElementById('postMessage').value;

  firebase.database().ref('post').child(firebase.auth().currentUser.uid).push().set({
    message,
    email: firebase.auth().currentUser.email
  }).then(() => {
  alert('โพสสำเร็จ');
  document.getElementById('postMessage').value = '';
  })
});

document.querySelector('#formUpdateName').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('updateNameText').value;

  firebase.database().ref('user').child(firebase.auth().currentUser.uid).update({
    name
  }).then(() => {
  alert('อัพเดทชื่อสำเร็จ');
  })
});

firebase.database().ref("user").once("value", snap => {
  document.getElementById('loading-post').style.display = 'none';
  console.log(snap.val());
  snap.forEach(snap => {
    firebase.database().ref("post").child(snap.key).limitToLast(10).on("child_added", snap => {
      var text = document.createElement('p');
      text.innerHTML = `<span style='background: #0090ff;color: #ffffff;padding: 5px 10px 5px 10px;border-radius: 10px;'>${snap.val().email || 'ไม่ได้ระบุชื่อ'}</span> <span style="margin-left:1rem">${snap.val().message}</span>`;
      document.getElementById('showPostMessage').appendChild(text);
    })
  })
})

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    firebase.database().ref("user").child(user.uid).on("value", snap => {
      const name = snap.val().name || '';
      document.getElementById('updateNameText').value = name;
      document.getElementById('showUpdateName').innerHTML = 'สวัสดีคุณ '+ name;
    })
  }
})