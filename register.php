<?php
/*
Collaborators/
register.php
tjs 101012

file version 1.02 

release version 1.06
*/

require_once( "common.inc.php" );

if ( isset( $_POST["action"] ) and $_POST["action"] == "register" ) {
  processForm();
} else {
  displayForm( array(), array(), new Member( array() ) );
}

function displayForm( $errorMessages, $missingFields, $member ) {
  //displayPageHeader( "Sign up for the book club!" );
  displayPageHeader( "Sign up as Collogistics collaborator!" );

  if ( $errorMessages ) {
    foreach ( $errorMessages as $errorMessage ) {
      echo $errorMessage;
    }
  } else {
?>
    <p>Thanks for choosing to join Collogistics.</p>
    <p>To register, please fill in your details below and click Send Details.</p>
    <p>Fields marked with an asterisk (*) are required.</p>
<?php } ?>

    <form action="register.php" method="post" style="margin-bottom: 50px;">
      <div style="width: 30em;">
        <input type="hidden" name="action" value="register" />

        <label for="username"<?php validateField( "username", $missingFields ) ?>>Choose a username *</label>
        <input type="text" name="username" id="username" value="<?php echo $member->getValueEncoded( "username" ) ?>" />

        <label for="password1"<?php if ( $missingFields ) echo ' class="error"' ?>>Choose a password *</label>
        <input type="password" name="password1" id="password1" value="" />
        <label for="password2"<?php if ( $missingFields ) echo ' class="error"' ?>>Retype password *</label>
        <input type="password" name="password2" id="password2" value="" />

        <label for="emailAddress"<?php validateField( "emailAddress", $missingFields ) ?>>Email address *</label>
        <input type="text" name="emailAddress" id="emailAddress" value="<?php echo $member->getValueEncoded( "emailAddress" ) ?>" />

        <label for="firstName"<?php validateField( "firstName", $missingFields ) ?>>First name *</label>
        <input type="text" name="firstName" id="firstName" value="<?php echo $member->getValueEncoded( "firstName" ) ?>" />

        <label for="lastName"<?php validateField( "lastName", $missingFields ) ?>>Last name *</label>
        <input type="text" name="lastName" id="lastName" value="<?php echo $member->getValueEncoded( "lastName" ) ?>" />

        <label<?php validateField( "gender", $missingFields ) ?>>Your gender: *</label>
        <label for="genderMale">Male</label>
        <input type="radio" name="gender" id="genderMale" value="m"<?php setChecked( $member, "gender", "m" )?>/>
        <label for="genderFemale">Female</label>
        <input type="radio" name="gender" id="genderFemale" value="f"<?php setChecked( $member, "gender", "f" )?> />

        <label for="primarySkillArea">What's your primary skill?</label>
        <select name="primarySkillArea" id="primarySkillArea" size="1">
        <?php foreach ( $member->getSkills() as $value => $label ) { ?>
          <option value="<?php echo $value ?>"<?php setSelected( $member, "primarySkillArea", $value ) ?>><?php echo $label ?></option>
        <?php } ?>
        </select>

        <label for="otherSkills">What are your other interests?</label>
        <textarea name="otherSkills" id="otherSkills" rows="4" cols="50"><?php echo $member->getValueEncoded( "otherSkills" ) ?></textarea>

        <div style="clear: both;">
          <input type="submit" name="submitButton" id="submitButton" value="Send Details" />
          <input type="reset" name="resetButton" id="resetButton" value="Reset Form" style="margin-right: 20px;" />
        </div>

      </div>
    </form>
<?php
  displayPageFooter();
}

function processForm() {
  $requiredFields = array( "username", "password", "emailAddress", "firstName", "lastName", "gender" );
  $missingFields = array();
  $errorMessages = array();

  $member = new Member( array( 
    "username" => isset( $_POST["username"] ) ? preg_replace( "/[^ \-\_a-zA-Z0-9]/", "", $_POST["username"] ) : "",
    "password" => ( isset( $_POST["password1"] ) and isset( $_POST["password2"] ) and $_POST["password1"] == $_POST["password2"] ) ? preg_replace( "/[^ \-\_a-zA-Z0-9]/", "", $_POST["password1"] ) : "",
    "firstName" => isset( $_POST["firstName"] ) ? preg_replace( "/[^ \'\-a-zA-Z0-9]/", "", $_POST["firstName"] ) : "",
    "lastName" => isset( $_POST["lastName"] ) ? preg_replace( "/[^ \'\-a-zA-Z0-9]/", "", $_POST["lastName"] ) : "",
    "gender" => isset( $_POST["gender"] ) ? preg_replace( "/[^mf]/", "", $_POST["gender"] ) : "",
    "primarySkillArea" => isset( $_POST["primarySkillArea"] ) ? preg_replace( "/[^a-zA-Z]/", "", $_POST["primarySkillArea"] ) : "",
    "emailAddress" => isset( $_POST["emailAddress"] ) ? preg_replace( "/[^ \@\.\-\_a-zA-Z0-9]/", "", $_POST["emailAddress"] ) : "",
    "otherSkills" => isset( $_POST["otherSkills"] ) ? preg_replace( "/[^ \'\,\.\-a-zA-Z0-9]/", "", $_POST["otherSkills"] ) : "",
    "joinDate" => date( "Y-m-d" )
  ) );

  foreach ( $requiredFields as $requiredField ) {
    if ( !$member->getValue( $requiredField ) ) {
      $missingFields[] = $requiredField;
    }
  }

  if ( $missingFields ) {
    $errorMessages[] = '<p class="error">There were some missing fields in the form you submitted. Please complete the fields highlighted below and click Send Details to resend the form.</p>';
  }

  if ( !isset( $_POST["password1"] ) or !isset( $_POST["password2"] ) or !$_POST["password1"] or !$_POST["password2"] or ( $_POST["password1"] != $_POST["password2"] ) ) {
    $errorMessages[] = '<p class="error">Please make sure you enter your password correctly in both password fields.</p>';
  }

  if ( Member::getByUsername( $member->getValue( "username" ) ) ) {
    $errorMessages[] = '<p class="error">A member with that username already exists in the database. Please choose another username.</p>';
  }

  if ( Member::getByEmailAddress( $member->getValue( "emailAddress" ) ) ) {
    $errorMessages[] = '<p class="error">A member with that email address already exists in the database. Please choose another email address, or contact the webmaster to retrieve your password.</p>';
  }

  if ( $errorMessages ) {
    displayForm( $errorMessages, $missingFields, $member );
  } else {
    $member->insert();
    displayThanks();
  }
}

function displayThanks() {
  displayPageHeader( "Thanks for registering!" );
?>
    <p>Thank you, you are now a registered member of Collogistics.</p>
    <br/>
    <a href="index.html">Home</a>
<?php
  displayPageFooter();
}
?>
