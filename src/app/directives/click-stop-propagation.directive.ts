import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[clickStopPropagation]'
})
export class ClickStopPropagationDirective {
  @HostListener("click", ["$event"])
  public onClick(event: any): void
  {
    event.stopPropagation();
  }
  
  @HostListener('keydown.space', ['$event'])
  onSpacebar(event: KeyboardEvent): void {
    event.stopPropagation();
  }
}
