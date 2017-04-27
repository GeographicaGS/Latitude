import { LatitudePage } from './app.po';

describe('latitude App', () => {
  let page: LatitudePage;

  beforeEach(() => {
    page = new LatitudePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
