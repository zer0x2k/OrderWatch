import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'loading-spinner',
  styleUrl: 'loading-spinner.css',
  shadow: true,
})
export class LoadingSpinner {
  @Prop() isLoading: boolean;
  render() {
    const classes = this.isLoading ? 'hidden':'';
    return (
      <Host>
        {
          this.isLoading ?
          <div class="loading-wrapper">
            <div class="loading-spinner">
              <span class="loading-spin"></span>
            </div>
          </div>
          :
          null
        }
        <div class={classes}>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
