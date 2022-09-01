import { Icon, IconProps } from "@common/components/Icons";

export function EventIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <svg id="Layer_2" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          d="M25.33,5.74H23.47V2.94A.93.93,0,0,0,22.32,2L6.46,5.77l-.07,0-.17.08L6.07,6a1.15,1.15,0,0,0-.22.28,1.11,1.11,0,0,0-.1.35s0,0,0,.08V29.06a.93.93,0,0,0,.93.93H25.33a.93.93,0,0,0,.93-.93V6.67A.93.93,0,0,0,25.33,5.74Zm-3.73,0H14.71L21.6,4.12Zm2.79,22.38H7.61V7.61H24.39Z"
        />
        <path
          fill="currentColor"
          d="M21.59,17.87h-1.1a2.76,2.76,0,0,0,.17-.93V15.07a.93.93,0,0,0-.93-.93H17.85a2.78,2.78,0,0,0-1.87.73,2.78,2.78,0,0,0-1.87-.73H12.26a.93.93,0,0,0-.93.93v1.87a2.76,2.76,0,0,0,.17.93h-1.1a.93.93,0,0,0,0,1.87h0v5.59a.93.93,0,0,0,.93.93h9.33a.93.93,0,0,0,.93-.93V19.73h0a.93.93,0,1,0,0-1.87ZM17.85,16h.93v.93a.93.93,0,0,1-.91.93h-1v-.93A.93.93,0,0,1,17.85,16Zm-4.67.93V16h.93a.93.93,0,0,1,.93.93v.93h-1A.93.93,0,0,1,13.19,16.94Zm-.93,2.79h2.8v4.66h-2.8Zm7.47,4.66h-2.8V19.74h2.8Z"
        />
        <path
          fill="currentColor"
          d="M11.34,11.33h9.33a.93.93,0,0,0,0-1.87H11.34a.93.93,0,1,0,0,1.87Z"
        />
      </svg>
    </Icon>
  );
}

export function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

export function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}
