import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {
  groups: Observable<any>;

  constructor(
    private auth: AuthService,
    private router: Router,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.groups = this.chatService.getGroups();
  }

  signOut() {
    this.auth.signOut().then(() => {
      this.router.navigateByUrl('/login');
    });
  }

}
