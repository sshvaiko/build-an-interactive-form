;(function($) {
    "use strict";

    const $form = $('form');
    const $jobRole = $form.find('#title');
    const $jobRoleExtra = $form.find('#other-title');
    const $designTheme = $form.find('#design');
    const $designColor = $form.find('#color');
    const $designColorContainer = $form.find('#colors-js-puns');
    const $colorOptions = $designColor.children(); // get all color options
    const $activities = $form.find('.activities');
    const $totalPrice = $('<p>Total: $<span></span></p>').hide(); // create an element for total price
    const $paymentMethod = $form.find('#payment');
    const $paymentInfo = $form.find('.payment-info');
    const defaultMethod = 'credit-card';
    const $submitButton = $form.find('button');

    $(window).on('load', function() {

        /**
         * Set the focus on the first form element.
         */
        function setFirstInputFocus() {
          const $firstInput = $form.find('input[type="text"]:first');
          $firstInput.focus();
        }

        /**
         * Show target element if another element has specified value.
         * @param  {object} dependentElement  An element to track
         * @param  {string} dependentValue    A value for conditiolan statement
         * @param  {object} targetElement     An element to show
         */
        function showExtraField(dependentElement, dependentValue, targetElement) {
          // hide target element when page loaded
          targetElement.hide();
          // show target element if user chose specified value
          dependentElement.on('change', (e) => {
            if(dependentElement.val() === dependentValue) {
              targetElement.show();
            } else {
              targetElement.hide();
            }
          });
        }

        /**
         * Updating price for activities.
         */
        function updatePrice() {
          let $selectedActivities = $activities.find('input:checked');
          let price = 0;
          // check all checked activities and consider the price
          $selectedActivities.each( (i, item) => {
            let $element = $(item);
            price += parseInt($element.attr('data-price'));
          });
          if(price > 0) {
            $totalPrice.find('span').text(price).show();
          } else {
            $totalPrice.hide();
          }
        }

        /**
         * Validate email by using regex
         * @param  {string} email string to validate
         * @return {boolean} true if it is an email or false it is not
         */
        function validateEmail(email) {
          let regex = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
          if (regex.test(email)) {
            return true;
          } else {
            return false;
          }
        }

        /**
         * Validate number by using regex
         * @param  {string} email string to validate
         * @return {boolean} true if it is an number or false it is not
         */
        function validateNumber(number) {
          let regex = /^[0-9]+$/;
          if (regex.test(number)) {
            return true;
          } else {
            return false;
          }
        }

        function validate() {
          // get fields
          const $validateInputs = $('.js-validate');

          // remove old messages
          $(".error-mesage").remove();
          $validateInputs.removeClass('error');
          let error = false;
          // check text fields
          $validateInputs.each( (i, item) => {
            let $input = $(item);
            // first check if field is not empty
            if($input.hasClass('required') && $input.val() == '') {
              $input.after('<div class="error-mesage">Please fill out this field.</div>');
              $input.addClass('error');
              error = true;
            } else {
              // for an email field
              if($input.hasClass('email') && !validateEmail($input.val())) {
                $input.after('<div class="error-mesage">Please fill correct email.</div>');
                error = true;
              }
              // for number field
              else if($input.hasClass('numberfield')) {
                if(!validateNumber($input.val())) {
                  $input.after('<div class="error-mesage">Please use numbers.</div>');
                  error = true;
                } else {
                  if($input.val().length !== parseInt($input.attr('data-size'))) {
                    let errorMessage = $input.attr('data-message');
                     $input.after('<div class="error-mesage">' + errorMessage + '</div>');
                     error = true;
                  }
                }
              }
            }
          });

          // check activities fields
          let activitiesCount = $activities.find('input:checked').length;
          if(activitiesCount < 1) {
            $activities.append('<div class="error-mesage">Please select at least one activity.</div>')
            error = true;
          }

          if(error) {
            $submitButton.attr('disabled', true);
          } else {
            $submitButton.attr('disabled', false);
          }

        }

        /**
         * Use setTimeout because Chrome works incorrect with $.focus(),
         * it doesn't have enought time to set blur because page loads so fast.
         */
        setTimeout( () => {
          setFirstInputFocus();
        }, 1);

        /**
         * First hide Job Role extra field, then show it if user chose 'Other'.
         */
        showExtraField($jobRole, 'other', $jobRoleExtra);

        /**
         * T-Shirt color menu displays the color options that match the design.
         */
        // hide color options when page loaded
        $designColorContainer.hide();
        $designTheme.on('change', (e) => {
           // get current theme
           let selectedTheme = $designTheme.find('option:selected').attr('data-name');

           // remove all options from select
           $designColor.empty();

           // go throught all options and show only matching
           if(selectedTheme) {
             $designColorContainer.show();
             $colorOptions.each( (i, item) => {
               let $element = $(item);
               let value = $element.attr('data-relation');
               if(value === selectedTheme) {
                 $designColor.append($element);
               }
             });
           } else {
             // if user didn't choose theme hide color select
             $designColorContainer.hide();
           }
         });

         /**
          * Check activities when use changes them.
          * Update price and disable if have conflict.
          */
         $activities.append($totalPrice);
         $activities.on('change', 'input', (e) => {
           // update price
           updatePrice();

           // check conflicts
           let target = $(e.target);
           let selectedTime = target.attr('data-time');
           if(target.is(':checked')) {
             // disable other options with the same date and time
             $activities.find('input[data-time=' + selectedTime + ']:not(:checked)').attr('disabled', true);
           } else {
             // enable other options
             $activities.find('input[data-time=' + selectedTime + ']').attr('disabled', false);
           }
         });

         /**
          * Payment methods.
          * Lest show credit card payment info (default value),
          * and then show payment info for selected method.
          */
         $paymentMethod.val(defaultMethod);
         $paymentInfo.parent().find('.payment-info:not(#' + defaultMethod +')').hide();

         $paymentMethod.on('change', (e) => {
           let method = $paymentMethod.val();
           let $methodInfo = $('#' + method);
           let $otherInfo = $paymentInfo.parent().find('.payment-info:not(#' + method +')');
           //show target info
           $methodInfo.show();
           $methodInfo.find('input').addClass('js-validate');

           // hide the rest info
           $otherInfo.hide();

           // disable validation for the incative methods
           $otherInfo.find('input').removeClass('js-validate');

           validate();
         });

         /**
          * Form validation.
          */
         // disable browser validation
         $form.attr('novalidate', true);

         // validate when submit
         $form.on('submit', (e) => {
           validate();
         });

         // validate when user change input fields
         $form.on('keyup change', 'input', (e) => {
           validate();
         });

    });
})(jQuery);
