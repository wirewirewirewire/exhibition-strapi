import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { get, isEmpty } from "lodash";
import {
  CheckPermissions,
  prefixFileUrlWithBackendUrl,
} from "strapi-helper-plugin";
import pluginPermissions from "strapi-plugin-upload/admin/src/permissions";
import {
  getTrad,
  formatFileForEditing,
} from "strapi-plugin-upload/admin/src/utils";
import CardControl from "strapi-plugin-upload/admin/src/components/CardControl";
import CardControlWrapper from "strapi-plugin-upload/admin/src/components/InputMedia/CardControlWrapper";
import CardPreviewWrapper from "strapi-plugin-upload/admin/src/components/InputMedia/CardPreviewWrapper";
import EmptyInputMedia from "strapi-plugin-upload/admin/src/components/InputMedia/EmptyInputMedia";
import EmptyText from "strapi-plugin-upload/admin/src/components/InputMedia/EmptyText";
import IconUpload from "strapi-plugin-upload/admin/src/components/InputMedia/IconUpload";
import InputFilePreview from "strapi-plugin-upload/admin/src/components/InputMedia/InputFilePreview";
import InputModalStepper from "strapi-plugin-upload/admin/src/containers/InputModalStepper";
import Name from "strapi-plugin-upload/admin/src/components/InputMedia/Name";
import Wrapper from "strapi-plugin-upload/admin/src/components/InputMedia/Wrapper";
import Input from "strapi-plugin-upload/admin/src/components/Input";
import ErrorMessage from "strapi-plugin-upload/admin/src/components/InputMedia/ErrorMessage";

const InputMedia = ({
  disabled,
  label,
  onChange,
  name,
  attribute,
  value,
  type,
  id,
  error,
}) => {
  const [modal, setModal] = useState({
    isOpen: false,
    step: "list",
    fileToEdit: null,
    isDisplayed: false,
  });
  const [fileToDisplay, setFileToDisplay] = useState(0);
  const hasNoValue = !!value && Array.isArray(value) && value.length === 0;
  const currentFile = attribute.multiple ? value[fileToDisplay] : value;
  const fileURL = get(currentFile, ["url"], null);
  const prefixedFileURL = fileURL ? prefixFileUrlWithBackendUrl(fileURL) : null;
  const displaySlidePagination =
    attribute.multiple && value.length > 1
      ? ` (${fileToDisplay + 1}/${value.length})`
      : "";
  const inputId = id || name;
  const errorId = `error-${inputId}`;

  useEffect(() => {
    setFileToDisplay(0);
  }, [modal.isOpen]);

  const handleClickToggleModal = () => {
    if (!disabled) {
      setModal((prev) => ({
        isDisplayed: true,
        step: "list",
        isOpen: !prev.isOpen,
        fileToEdit: null,
      }));
    }
  };

  const handleClosed = () =>
    setModal((prev) => ({ ...prev, isDisplayed: false }));

  const handleChange = (v) => {
    onChange({ target: { name, type, value: v } });
  };

  const handleFilesNavigation = (displayNext) => {
    if (attribute.multiple) {
      if (displayNext && fileToDisplay === value.length - 1) {
        setFileToDisplay(0);

        return;
      }

      if (!displayNext && fileToDisplay === 0) {
        setFileToDisplay(value.length - 1);
      } else {
        setFileToDisplay((prev) => (displayNext ? prev + 1 : prev - 1));
      }
    }
  };

  const handleRemoveFile = () => {
    const newValue = attribute.multiple
      ? value.filter((file, index) => index !== fileToDisplay)
      : null;

    if (Array.isArray(newValue) && fileToDisplay === newValue.length) {
      setFileToDisplay(fileToDisplay > 0 ? fileToDisplay - 1 : fileToDisplay);
    }

    handleChange(newValue);
  };

  const handleEditFile = () => {
    setModal(() => ({
      isDisplayed: true,
      isOpen: true,
      step: "edit",
      fileToEdit: formatFileForEditing(currentFile),
    }));
  };

  const handleCopy = () => {
    strapi.notification.toggle({
      type: "info",
      message: { id: "notification.link-copied" },
    });
  };

  const handleAllowDrop = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    e.persist();

    if (e.dataTransfer) {
      setModal(() => ({
        isDisplayed: true,
        isOpen: true,
        step: "upload",
        filesToUpload: e.dataTransfer.files,
      }));
    }
  };

  return (
    <Wrapper hasError={!isEmpty(error)}>
      <Name htmlFor={name}>{`${label}${displaySlidePagination}`}</Name>

      <CardPreviewWrapper onDragOver={handleAllowDrop} onDrop={handleDrop}>
        <CardControlWrapper>
          {!disabled && (
            <CardControl
              small
              title="add"
              color="#9EA7B8"
              type="plus"
              onClick={handleClickToggleModal}
            />
          )}
          {!hasNoValue && !disabled && (
            <>
              <CheckPermissions permissions={pluginPermissions.update}>
                <CardControl
                  small
                  title="edit"
                  color="#9EA7B8"
                  type="pencil"
                  onClick={handleEditFile}
                />
              </CheckPermissions>
              {/* <CheckPermissions permissions={pluginPermissions.copyLink}>
                <a href={prefixedFileURL} text={prefixedFileURL}>
                  <CardControl
                    small
                    title="copy-link"
                    color="#9EA7B8"
                    type="link"
                  />
                </a>
          </CheckPermissions>*/}
              <CheckPermissions permissions={pluginPermissions.copyLink}>
                <CopyToClipboard onCopy={handleCopy} text={prefixedFileURL}>
                  <CardControl
                    small
                    title="copy-link"
                    color="#9EA7B8"
                    type="link"
                  />
                </CopyToClipboard>
              </CheckPermissions>
              <CardControl
                small
                title="delete"
                color="#9EA7B8"
                type="trash-alt"
                onClick={handleRemoveFile}
              />
            </>
          )}
        </CardControlWrapper>
        {hasNoValue ? (
          <EmptyInputMedia onClick={handleClickToggleModal} disabled={disabled}>
            <IconUpload />
            <EmptyText id={getTrad("input.placeholder")} />
          </EmptyInputMedia>
        ) : (
          <InputFilePreview
            isSlider={attribute.multiple && value.length > 1}
            file={currentFile}
            onClick={handleFilesNavigation}
          />
        )}
        <Input type="file" name={name} />
      </CardPreviewWrapper>
      {modal.isDisplayed && (
        <InputModalStepper
          isOpen={modal.isOpen}
          onClosed={handleClosed}
          step={modal.step}
          fileToEdit={modal.fileToEdit}
          filesToUpload={modal.filesToUpload}
          multiple={attribute.multiple}
          onInputMediaChange={handleChange}
          selectedFiles={value}
          onToggle={handleClickToggleModal}
          allowedTypes={attribute.allowedTypes}
        />
      )}
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </Wrapper>
  );
};

InputMedia.propTypes = {
  attribute: PropTypes.shape({
    allowedTypes: PropTypes.arrayOf(PropTypes.string),
    multiple: PropTypes.bool,
    required: PropTypes.bool,
    type: PropTypes.string,
  }).isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
InputMedia.defaultProps = {
  disabled: false,
  id: null,
  error: null,
  label: "",
  value: null,
};

export default InputMedia;
