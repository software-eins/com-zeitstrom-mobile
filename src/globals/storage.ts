class TutorialManager {
  private _getTutorials(): any {
    let tutorials = {};
    try {
      tutorials = JSON.parse(localStorage.tutorials)
    } catch {
      localStorage.tutorials = JSON.stringify({});
    }
    return tutorials;
  }

  private _updateTutorials(tutorials: any) {
    localStorage.tutorials = JSON.stringify(tutorials);
  }

  isSeen(key: string) {
    const tutorials = this._getTutorials();
    console.log(tutorials);
    return Boolean(tutorials[key]);
  }

  markAsSeen(key: string) {
    const tutorials = this._getTutorials();
    tutorials[key] = true;
    this._updateTutorials(tutorials);
  }
}


const tutorialManager = new TutorialManager();

export { tutorialManager }
