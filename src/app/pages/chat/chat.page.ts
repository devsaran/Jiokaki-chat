import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Observable } from 'rxjs';
import { ChatService } from './../../services/chat.service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  messages: Observable<any[]>;
  newMsg = '';
  chatTitle = '';
  currentUserId = this.auth.currentUserId;
  chat = null;

  @ViewChild(IonContent, { static: false }) content: IonContent;
  @ViewChild('input', { read: ElementRef, static: false }) msgInput: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private chatService: ChatService,
    private router: Router,
    private camera: Camera
  ) { }

  ngOnInit() {
    this.route.params.subscribe(data => {
      this.chatService.getOneGroup(data.id).subscribe(res => {
        this.chat = res;
        console.log('my chat: ', this.chat);
        this.messages = this.chatService.getChatMessages(this.chat.id).pipe(
          map(messages => {
            for (let msg of messages) {
              msg['user'] = this.getMsgFromName(msg['from']);
            }
            console.log('messages: ', messages);
            return messages;
          })
        );
      });
    });
  }

  getMsgFromName(userId) {
    for (let usr of this.chat.users) {
      if (usr.id === userId) {
        return usr.nickname;
      }
    }
    return 'Deleted';
  }

  sendMessage() {
    this.chatService.addChatMessage(this.newMsg, this.chat.id).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }

  resize() {
    this.msgInput.nativeElement.style.height = this.msgInput.nativeElement.scrollHeight + 'px';
  }

  leave() {
    let newUsers = this.chat.users.filter(usr => usr.id !== this.auth.currentUserId);

    this.chatService.leaveGroup(this.chat.id, newUsers).subscribe(res => {
      this.router.navigateByUrl('/chats');
    });
  }

  sendFile() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(data => {

      let obj = this.chatService.addFileMessage(data, this.chat.id);
      let task = obj.task;

      task.then(res => {
        obj.ref.getDownloadURL().subscribe(url => {
          this.chatService.saveFileMessage(url, this.chat.id);
        });
      });

      task.percentageChanges().subscribe(change => {
        console.log('change: ', change);
      });
    });


  }
}
