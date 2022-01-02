import { Injectable } from '@angular/core';
import { About, Pages, Profile } from 'atlas-core';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/app';

@Injectable()
export class AppService {
  user: firebase.User;

  private profile: Profile = new Profile();
  private pages: Pages = new Pages();
  private modal = new BehaviorSubject<string>('');
  modalCloseEvent = this.modal.asObservable();

  closeModal(s: string) {
    this.modal.next(s);
  }

  constructor() {
    if (true) {
      this.getProfile_Maharaja();
    } else {
      this.getProfile_MohanChem();
    }
  }

  public getUser() {
    return this.user;
  }

  public setUser(user: firebase.User) {
    this.user = user;
  }

  public getProfile() {
    return this.profile;
  }

  public getPages() {
    return this.pages;
  }

  private getProfile_Maharaja() {
    this.profile.title = 'Maharaja Architects Pvt. Ltd.';
    this.profile.background = 'assets/images/profile/arch-1.jpg';
    this.profile.caption = 'Providing    innovative  designs!';
    this.profile.icon = 'assets/images/profile/logo.jpg';

    const about = new About();
    about.paragraph.push(
      'Maharaja Architects Pvt. Ltd. is specializing in rendering services for repairs & restoration of civil structures. In the relatively short span of time, we have carried out quality jobs using a systematic & scientific approach and applying a professional attitude to largely unorganized sector. From 1998 till now, we also worked in the name of “R. M. Patidar & Associates” as Repair board Architect.'
    );
    about.paragraph.push(
      'We take this opportunity to introduce ourselves as Civil and Structural Consultants Specialized in “New Construction” and Building “Repairs & Restorations” , who assist the client on all aspect of services carrying out their project in the most smooth and economical way.'
    );
    about.paragraph.push(
      'The company has a Team of Structural Design Engineer- Architect, Project Managers, Executive Engineers – supervisors, Structural Auditor, Valuer and Marketing Team, who have got vast experience in Consulting & Executing services for New Construction and Building Repairs and Rehabilitation Projects.'
    );
    this.pages.about.push(about);
  }

  private getProfile_MohanChem() {
    this.profile.title = 'Mohan Chemicals Pvt. Ltd.';
    this.profile.background = 'assets/images/profile/mc/background.jpg';
    this.profile.caption = 'Building    Trust   since        1998!';
    this.profile.icon = 'assets/images/profile/mc/mc-logo.png';

    const about = new About();
    about.paragraph.push(
      'We, Mohan Chemical, were incorporated in the year 1965, as Manufacturer, Supplier, Trader and Retailer of a diverse range of Organic and Inorganic Chemicals . The range involves Industrial Chemicals, Waterproofing Chemicals and Construction Chemicals. Our Chemicals are considered one of the best that is available in the market. These products provided by us are appreciated in the market for their long shelf life, balanced pH, accurate composition and high effectiveness. In addition, our ethical work practices have helped us to achieve a huge client base spreading all over the world. We also provide Laboratory Products required for Schools and Colleges.'
    );
    about.paragraph.push(
      'The highly developed state-of-the-art infrastructure is known to be one of the finest in the nation. The facility is laced with modernized technology and advanced machinery. For the purpose of achieving smooth operations, we have divided our infrastructure into several units. The units guided by qualified and expert professionals work effectively and efficiently, in order to achieve several organizational objectives. All the products we provide in the market are further sent for a number of quality checks, for final assurance.'
    );
    this.pages.about.push(about);
  }
}
