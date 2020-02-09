import { ChatService } from './../../services/chat.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.page.html',
  styleUrls: ['./start-chat.page.scss'],
})
export class StartChatPage implements OnInit {
  users = [];
  title = '';
  participant = '';
  
  constructor(private chatService: ChatService, private router: Router) { }

  ngOnInit() {
  }

  addUser() {
    let obs = this.chatService.findUser(this.participant);

    forkJoin(obs).subscribe(res => {
      for (let data of res) {
        if (data.length > 0) {
          this.users.push(data[0]);
        }
      }
      this.participant = '';
    });
  }

  createGroup() {
    this.chatService.createGroup(this.title, this.users).then(res => {
      this.router.navigateByUrl('/chats');
    });
  }

}
